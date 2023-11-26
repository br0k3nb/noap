import { useParams } from "react-router-dom";

type Props = {
    usePage?: boolean;
    absolutePath?: boolean;
    incrementPage?: boolean;
    decrementPage?: boolean;
    removeNoteId?: boolean;
    goToPageNumber?: number;
    getNoteIdInUrl?: boolean;
    getPageInUrl?: boolean; 
    getSearchQueryInUrl?: boolean;
    removeNoteIdAndIncrementPage?: boolean;
    removeNoteIdAndDecrementPage?: boolean,
};

export default function useGetUrl({
    removeNoteId,
    absolutePath,
    getPageInUrl,
    incrementPage,
    decrementPage,
    getNoteIdInUrl,
    goToPageNumber,
    getSearchQueryInUrl,
    removeNoteIdAndIncrementPage,
    removeNoteIdAndDecrementPage,
}: Props) {
    if(incrementPage && decrementPage) {
        throw new Error("IncrementPage and decrementPage are mutually exclusive");
    }
    
    const { noteId, page: pageNumber, search } = useParams();

    const page = pageNumber ? parseInt(pageNumber) : 1;
    const baseUrl = 'notes/page/';

    let url = '';
    let getters = [] as string[];

    if(getPageInUrl) getters = [...getters, page.toString()];
    if(getNoteIdInUrl) getters = [...getters, noteId ? noteId : ''];
    if(getSearchQueryInUrl) getters = [...getters, search ? search : ''];

    if(getters.length) return getters;

    switch (true) {
        case removeNoteIdAndIncrementPage: {
            url = baseUrl + (page + 1);
            break;
        }
        case removeNoteIdAndDecrementPage: {
            url = baseUrl + (page - 1);
            break;
        }
        case removeNoteId: {
            url = baseUrl + page;
            break;
        }
        case incrementPage: {
            if(search) url = baseUrl + (page + 1) + '/search' + search;
            else url = baseUrl + (page + 1);

            break;
        }
        case decrementPage: {
            if(search) url = baseUrl + (page - 1) + '/search' + search;
            else url = baseUrl + (page - 1);

            break;
        }
        case typeof goToPageNumber === "number": {
            if(search) url = baseUrl + goToPageNumber + '/search' + search;
            else url = baseUrl + goToPageNumber;

            break;
        }
        default: return 'Specify a parameter to use this hook';
    };

    if(absolutePath) url = url.padStart((url.length + 1), '/');

    return url;
}