import { useParams } from "react-router-dom";

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
        getSearchQueryInUrl?: boolean;
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
        getSearchQueryInUrl
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
    
    const { noteId, page: pageNumber, search } = useParams();

    const page = pageNumber ? parseInt(pageNumber) : 1;
    const baseUrl = "notes/page/";

    if(getNoteIdInUrl) return noteId ? noteId : '';
    if(getSearchQueryInUrl) return search ? search : '';
    if(getPageInUrl) return page;

    if(usePage && incrementPage) {
        if(noteId && !removeNoteId) {
            if(absolutePath) {
                return `/${baseUrl + (page + 1) + "/" + noteId}`;
            }
            return `${baseUrl + (page + 1) + "/" + noteId}`;
        } 

        if(absolutePath) {
            return `/${baseUrl + (page + 1)}`; 
        }
        return `${baseUrl + (page + 1)}`;
    }

    if(usePage && decrementPage) {
        if(noteId && !removeNoteId) {
            if(absolutePath) {
                return `/${baseUrl + (page - 1) + "/" + noteId}`;    
            }
            return `${baseUrl + (page - 1) + "/" + noteId}`;
        }
        
        if(absolutePath) {
            return `/${baseUrl + (page - 1)}`; 
        }
        return `${baseUrl + (page - 1)}`;
    }

    if(!usePage) {
        const customPageNumber = (goToPageNumber ? goToPageNumber : page);

        if(noteId && !removeNoteId) {
            if(absolutePath) {
                return `/${baseUrl + customPageNumber + "/" + noteId}`;
            }
            return `${baseUrl + customPageNumber + "/" + noteId}`;
        }

        if(absolutePath) {
            return `/${baseUrl + customPageNumber}`; 
        }
        return `${baseUrl + customPageNumber}`;
    }

    return '';
}