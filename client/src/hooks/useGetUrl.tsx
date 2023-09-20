import { useLocation } from "react-router-dom";

type Props = {
    options: {
        usePage: boolean;
        absolutePath?: boolean;
        incrementPage?: boolean;
        decrementPage?: boolean;
        removeNoteId?: boolean;
        goToPageNumber?: number;
        getNoteIdInUrl?: boolean;
        getPageInUrl?: boolean; 
    }
};

export default function useGetUrl({ options }: Props) {
    const { 
        usePage,
        absolutePath, 
        incrementPage, 
        decrementPage, 
        removeNoteId, 
        goToPageNumber,
        getNoteIdInUrl,
        getPageInUrl,
    } = options || {};

    if(!usePage && (incrementPage || decrementPage)) { 
        throw new Error("To use 'incrementPage' or 'decrementPage' you must set the 'usePage' property as true");
    }

    if(usePage && (!incrementPage && !decrementPage)) { 
        throw new Error("Please specify the 'incrementPage' or 'decrementPage' property");
    }

    if(incrementPage && decrementPage) {
        throw new Error("IncrementPage and decrementPage are mutually exclusive");
    }

    const location = useLocation();
    
    const findNoteIdInURL = new RegExp(`note\/(.*)`);
    const findPageInURL = new RegExp(`notes\/page\/([0-9]+)`);

    const pageInUrl = findPageInURL.exec(location.pathname) as Array<string>;
    const getNoteIdInURL = findNoteIdInURL.exec(location.pathname);

    if(getNoteIdInUrl && getNoteIdInURL) return getNoteIdInURL[1];

    const baseUrlWithoutPageNumber = pageInUrl[0].slice(0, 11);
    let pageNumber = parseInt(pageInUrl[1]);

    if(getPageInUrl && pageInUrl) return pageNumber;

    if(usePage && incrementPage) {
        if(getNoteIdInURL && !removeNoteId) {
            const noteId = getNoteIdInURL[0];

            if(absolutePath) {
                return `/${baseUrlWithoutPageNumber + (++pageNumber) + "/" + noteId}`;    
            }
            return `${baseUrlWithoutPageNumber + (++pageNumber) + "/" + noteId}`;
        } 

        if(absolutePath) {
            return `/${baseUrlWithoutPageNumber + (++pageNumber)}`; 
        }
        return `${baseUrlWithoutPageNumber + (++pageNumber)}`;
    }

    if(usePage && decrementPage) {
        if(getNoteIdInURL && !removeNoteId) {
            const noteId = getNoteIdInURL[0];
            
            if(absolutePath) {
                return `/${baseUrlWithoutPageNumber + (--pageNumber) + "/" + noteId}`;    
            }
            return `${baseUrlWithoutPageNumber + (--pageNumber) + "/" + noteId}`;
        }
        
        if(absolutePath) {
            return `/${baseUrlWithoutPageNumber + (--pageNumber)}`; 
        }
        return `${baseUrlWithoutPageNumber + (--pageNumber)}`;
    }

    if(!usePage) {
        const customPageNumber = (goToPageNumber ? goToPageNumber : pageNumber);

        if(getNoteIdInURL && !removeNoteId) {
            const noteId = getNoteIdInURL[0];
            if(absolutePath) {
                return `/${baseUrlWithoutPageNumber + customPageNumber + "/" + noteId}`;
            }
            return `${baseUrlWithoutPageNumber + customPageNumber + "/" + noteId}`;
        }

        if(absolutePath) {
            return `/${baseUrlWithoutPageNumber + customPageNumber}`; 
        }
        return `${baseUrlWithoutPageNumber + customPageNumber}`;
    }

    return '';
}