export type labelsState = {
    hasNextPage: boolean,
    page: number,
    search: number
}

export type labelsActions = { 
    type: "NEXT_PAGE" | "PAGE" | "SEARCH" | "PAGE_AND_SEARCH",
    payload: any,
}

export const labelsReducer = (state: labelsState, action: labelsActions) => {
    switch (action.type) { 
        case "NEXT_PAGE": {
            return {
               ...state,
                hasNextPage: action.payload,
            };
        }
        case "PAGE" : {
            return {
                ...state,
                page: action.payload,
            };
        }
        case "SEARCH" : {
            return {
                ...state,
                search: action.payload,
            };
        }
        case "PAGE_AND_SEARCH" : {
            return {
                ...state,
                page: action.payload.page,
                search: action.payload.search,
            };
        }
        default: {
            throw new Error("Invalid action type")
        }
    }
}

export const label_default_value = {
    hasNextPage: false,
    page: 1,
    search: ""
}
