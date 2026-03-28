import * as pdfjsLib from 'pdfjs-dist';

// This tells Vite to resolve the worker file path as a URL
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set the worker source using the resolved URL
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default pdfjsLib;