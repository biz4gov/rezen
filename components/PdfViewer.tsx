
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import type { TextItem, TextContent } from 'pdfjs-dist/types/src/display/api';
import type { StoredFile } from '../types';
import { ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Expand, Loader2, Search, ChevronUp, ChevronDown, X, Palette, FileWarning } from 'lucide-react';

// Setup para o worker do PDF.js, essencial para a biblioteca funcionar
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    files: Array<{
        label: string;
        source: File | StoredFile | null;
    }>;
}

// Custom text renderer to highlight search results
const highlightPattern = (text: string, pattern: string, color: 'yellow' | 'green'): React.ReactNode => {
    if (!pattern.trim()) {
        return text;
    }
    const sanitizedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${sanitizedPattern})`, 'gi');
    const parts = text.split(regex);

    if (parts.length <= 1) {
        return text;
    }
    
    const highlightClass = color === 'yellow' ? 'bg-yellow-400' : 'bg-green-400';

    return (
        <>
            {parts.map((part, i) => {
                if (i % 2 === 1) {
                    return <mark key={i} className={highlightClass}>{part}</mark>;
                }
                return part;
            })}
        </>
    );
};

const PdfViewer: React.FC<PdfViewerProps> = ({ files }) => {
    const [activeFileIndex, setActiveFileIndex] = useState(0);

    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInput, setPageInput] = useState<string>('1');
    const [scale, setScale] = useState<number>(1.0);
    const [zoomInput, setZoomInput] = useState('100');
    const [isFitToWidth, setIsFitToWidth] = useState<boolean>(true);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const [searchText, setSearchText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [textItems, setTextItems] = useState<Map<number, TextItem[]>>(new Map());
    const [highlightColor, setHighlightColor] = useState<'yellow' | 'green'>('yellow');

    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const activeFile = useMemo(() => files[activeFileIndex]?.source, [files, activeFileIndex]);

    useEffect(() => {
        setNumPages(0);
        setCurrentPage(1);
        setPageInput('1');
        setTextItems(new Map());
        setSearchText('');
        setSearchQuery('');
        pageRefs.current = [];
    }, [activeFileIndex, activeFile]);


    const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
        setNumPages(nextNumPages);
        pageRefs.current = Array(nextNumPages).fill(null);
    };
    
    const onGetTextSuccess = useCallback((pageNumber: number, textContent: TextContent) => {
        const pageTextItems = textContent.items.filter((item): item is TextItem => 'str' in item);
        setTextItems(prev => new Map(prev).set(pageNumber, pageTextItems));
    }, []);

    const onGetTextSuccessForPage = useCallback((pageNumber: number) => (textContent: TextContent) => {
        onGetTextSuccess(pageNumber, textContent);
    }, [onGetTextSuccess]);

    const textRenderer = useCallback(
        (textItem: TextItem) => highlightPattern(textItem.str, searchQuery, highlightColor),
        [searchQuery, highlightColor]
    );

    useEffect(() => {
        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                setContainerWidth(entries[0].contentRect.width);
            }
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => resizeObserver.disconnect();
    }, []);

    const scrollToPage = (page: number) => {
        if (page >= 1 && page <= numPages) {
            pageRefs.current[page - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    const handleGoToPage = () => {
        const page = parseInt(pageInput, 10);
        if (page >= 1 && page <= numPages) {
            scrollToPage(page);
        } else {
            setPageInput(String(currentPage));
        }
    };

    const handlePrevPage = () => scrollToPage(Math.max(currentPage - 1, 1));
    const handleNextPage = () => scrollToPage(Math.min(currentPage + 1, numPages));
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const pageNum = parseInt(entry.target.getAttribute('data-page-number')!, 10);
                    setCurrentPage(pageNum);
                    setPageInput(String(pageNum));
                }
            }
        }, { root: containerRef.current, threshold: 0.2 });

        const currentRefs = pageRefs.current;
        currentRefs.forEach(ref => {
            if (ref) observer.observe(ref);
        });

        return () => {
            currentRefs.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [numPages]);

    const handleZoomIn = () => { setIsFitToWidth(false); setScale(s => Math.min(s + 0.15, 3)); };
    const handleZoomOut = () => { setIsFitToWidth(false); setScale(s => Math.max(s - 0.15, 0.2)); };
    const handleFitToWidth = () => { setIsFitToWidth(true); setScale(1.0); };

    useEffect(() => {
      if (!isFitToWidth) {
        setZoomInput(String(Math.round(scale * 100)));
      } else {
        setZoomInput('Largura');
      }
    }, [scale, isFitToWidth]);

    const handleZoomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setZoomInput(e.target.value);
    };

    const handleZoomInputBlur = () => {
        const value = parseInt(zoomInput, 10);
        if (!isNaN(value)) {
            setIsFitToWidth(false);
            setScale(Math.max(20, Math.min(value, 300)) / 100);
        } else {
            setZoomInput(isFitToWidth ? 'Largura' : String(Math.round(scale * 100)));
        }
    };
    
    const handleSearchFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSearchQuery(searchText);
    };

    const pagesWithMatches = useMemo(() => {
        if (!searchQuery) return [];
        const pages: number[] = [];
        textItems.forEach((items, pageNum) => {
            const text = items.map(i => i.str).join('').toLowerCase();
            if (text.includes(searchQuery.toLowerCase())) {
                pages.push(pageNum);
            }
        });
        return pages;
    }, [searchQuery, textItems]);

    const handleNextMatchPage = () => {
        if (pagesWithMatches.length === 0) return;
        const nextPageWithMatch = pagesWithMatches.find(p => p > currentPage);
        scrollToPage(nextPageWithMatch || pagesWithMatches[0]);
    };
    
    const handlePrevMatchPage = () => {
        if (pagesWithMatches.length === 0) return;
        const prevPageWithMatch = [...pagesWithMatches].reverse().find(p => p < currentPage);
        scrollToPage(prevPageWithMatch || pagesWithMatches[pagesWithMatches.length - 1]);
    };

    const toggleHighlightColor = () => {
        setHighlightColor(prev => (prev === 'yellow' ? 'green' : 'yellow'));
    };

    const clearSearch = () => {
        setSearchText('');
        setSearchQuery('');
    };
    
    const fileSource = useMemo(() => {
        if (!activeFile) return null;
        if (activeFile instanceof File) {
            return activeFile;
        }
        if (activeFile.base64) {
            return `data:application/pdf;base64,${activeFile.base64}`;
        }
        return null; // No file or empty base64 string
    }, [activeFile]);

    const Toolbar = (
        <div className="flex-shrink-0 bg-gray-700 p-2 flex items-center justify-between text-white shadow-md z-10 flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevPage} disabled={!fileSource || currentPage <= 1} className="p-1.5 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ArrowLeft size={18}/> </button>
                    <div className="flex items-center text-sm">
                        <input type="text" value={pageInput} onChange={e => setPageInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGoToPage()} onBlur={handleGoToPage} className="w-10 text-center bg-gray-800 border border-gray-600 rounded-md p-1"/>
                        <span className="mx-2">/ {fileSource ? numPages : '-'}</span>
                    </div>
                     <button onClick={handleNextPage} disabled={!fileSource || currentPage >= numPages} className="p-1.5 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ArrowRight size={18}/> </button>
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 border-l border-gray-600 pl-2">
                     <button onClick={handleZoomOut} className="p-1.5 rounded-full hover:bg-gray-600 transition-colors"><ZoomOut size={18}/></button>
                     <div className="relative">
                        <input 
                            type="text" 
                            value={zoomInput}
                            onChange={handleZoomInputChange}
                            onBlur={handleZoomInputBlur}
                            onKeyDown={e => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                            className="w-16 text-center bg-gray-800 border border-gray-600 rounded-md p-1 text-sm"
                         />
                         { !isFitToWidth && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span> }
                     </div>
                     <button onClick={handleZoomIn} className="p-1.5 rounded-full hover:bg-gray-600 transition-colors"><ZoomIn size={18}/></button>
                     <button title="Ajustar à Largura" onClick={handleFitToWidth} className="p-1.5 rounded-full hover:bg-gray-600 transition-colors"><Expand size={18}/></button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <form onSubmit={handleSearchFormSubmit} className="flex items-center gap-2">
                  <div className="relative">
                    <input 
                      type="search" 
                      placeholder="Pesquisar..." 
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="bg-gray-800 border border-gray-600 rounded-md py-1 pl-7 pr-2 text-sm w-32 sm:w-40"
                    />
                    <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                  </div>
                  {searchQuery && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{pagesWithMatches.length > 0 ? `${pagesWithMatches.length} pág.` : 'Nenhum resultado'}</span>
                        <button type="button" onClick={handlePrevMatchPage} disabled={pagesWithMatches.length === 0} className="p-1.5 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors" title="Resultado anterior"> <ChevronUp size={16}/> </button>
                        <button type="button" onClick={handleNextMatchPage} disabled={pagesWithMatches.length === 0} className="p-1.5 rounded-full hover:bg-gray-600 disabled:opacity-50 transition-colors" title="Próximo resultado"> <ChevronDown size={16}/> </button>
                        <button type="button" onClick={toggleHighlightColor} className="p-1.5 rounded-full hover:bg-gray-600" title="Alterar cor do destaque"> <Palette size={16}/> </button>
                        <button type="button" onClick={clearSearch} className="p-1.5 rounded-full hover:bg-gray-600" title="Limpar busca"> <X size={16}/> </button>
                      </div>
                  )}
                </form>
                
                {files.filter(f => f.source).length > 1 && (
                    <div className="flex items-center gap-2 border-l border-gray-600 pl-2">
                        {files.map((f, index) => (
                            f.source && (
                                <button
                                    key={index}
                                    onClick={() => setActiveFileIndex(index)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${activeFileIndex === index ? 'bg-blue-600 text-white' : 'bg-gray-800 hover:bg-gray-600'}`}
                                >
                                    {f.label}
                                </button>
                            )
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
    
    return (
        <div className="flex flex-col h-full bg-gray-800 text-white">
            {Toolbar}
            <div ref={containerRef} className="flex-grow overflow-y-auto bg-gray-600">
                {fileSource ? (
                    <Document 
                        file={fileSource} 
                        onLoadSuccess={onDocumentLoadSuccess} 
                        loading={<div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8"/></div>}
                        className="flex flex-col items-center p-4 gap-4"
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <div key={`page_wrapper_${index + 1}`} ref={(el) => { pageRefs.current[index] = el; }} data-page-number={index + 1}>
                                <Page
                                    pageNumber={index + 1}
                                    scale={isFitToWidth ? 1 : scale}
                                    width={isFitToWidth && containerWidth > 0 ? containerWidth - 32 : undefined}
                                    className="shadow-lg"
                                    onGetTextSuccess={onGetTextSuccessForPage(index + 1)}
                                    customTextRenderer={textRenderer as any}
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                />
                            </div>
                        ))}
                    </Document>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <FileWarning size={48} className="mb-4 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-white">Arquivo Não Armazenado</h3>
                        <p className="text-sm text-gray-300 mt-2 max-w-sm">
                            Para economizar espaço de armazenamento no navegador, o conteúdo deste PDF não foi salvo.
                            Para visualizar ou analisar, por favor, carregue o arquivo novamente.
                        </p>
                        {activeFile?.name && <p className="text-xs mt-4 text-gray-400">Arquivo original: {activeFile.name}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfViewer;
