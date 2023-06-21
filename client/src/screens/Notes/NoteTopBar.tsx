import { useContext, SetStateAction, Dispatch } from "react";
import { useLocation, Link } from "react-router-dom";
import { BsJournalText, BsSearch, BsFilter, BsXLg, BsList } from "react-icons/bs";
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";

import { NoteCtx } from "../../context/SelectedNoteCtx";

import { motion } from "framer-motion";

type Props = {
    page: number;
    search: string;
    navbar: boolean;
    totalDocs: number;
    showSearch: boolean;
    hasNextPage: boolean;
    setPage: Dispatch<SetStateAction<number>>;
    setSearch: Dispatch<SetStateAction<string>>;
    setNavbar: Dispatch<SetStateAction<boolean>>;
    setShowSearch: Dispatch<SetStateAction<boolean>>;
}

export default function NoteTopBar({ 
        page, 
        search, 
        navbar, 
        totalDocs, 
        showSearch, 
        hasNextPage, 
        setNavbar, 
        setPage, 
        setSearch, 
        setShowSearch 
    }: Props) {
        
    const { selectedNote, setSelectedNote } = useContext(NoteCtx) as any;
    const location = useLocation();

    const baseURL = location.pathname.slice(0, (location.pathname.length - String(page).length));

    const handleSearchClick = () => {
        setShowSearch(showSearch ? false : true);
        setSearch('');
    };

    const onInputChange = (currentTarget: HTMLInputElement) => {
        selectedNote && setSelectedNote(null);
        setSearch(currentTarget.value);
    };

    const handleNextPageClick = () => {
        setPage(page + 1);
        selectedNote && setSelectedNote(null);
    };

    const handlePrevPageClick = () => {
        setPage(page - 1);
        selectedNote && setSelectedNote(null);
    }

    const hide = { opacity: 0, transitionEnd: { display: "none" }};
    const show = { display: "block", opacity: 1 };

    return (
        <>
            <div className="overflow-hidden flex flex-col pt-2 bg-gray-800 h-[100px]">
                <div className="flex flex-col mb-[4px]">
                    <div className="flex flex-row justify-between px-3 py-2 text-gray-200">
                        <div className="text-center flex flex-row space-x-1 px-2">
                        <span> <BsJournalText size={23} className="pt-1" /> </span>
                            <p className="text-xl">Notes</p>
                        </div>
                        <button className="sm:hidden" onClick={() => setNavbar(!navbar)}>
                            {!navbar ? <BsList size={29} /> : <BsXLg size={23} className="mb-[2px] mr-1 mt-1" />}
                        </button>
                    </div>
                    <div className="flex flex-row flex-wrap gap-x-1 justify-between px-3 py-2 max-w-screen text-gray-200">
                        <p className="pl-3 pt-1">{totalDocs} notes</p>
                        <div className="flex flex-row space-x-2">
                            <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> <BsFilter size={25}/> </div>
                            <div className="tooltip tooltip-left" data-tip="Search">
                                <button type="button" className="hover:bg-stone-700 px-1 py-1 rounded" onClick={() => handleSearchClick()}>
                                    <BsSearch size={25} className="py-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <motion.div
                animate={showSearch ? show : hide}
                transition={{ duration: 0.4 }}
                className={`bg-gray-800 px-6 pb-2 hidden ${showSearch && "!grid"}`}
            >
                <input
                    className="sign-text-inputs bg-stone-900 text-gray-300 h-10 border !border-gray-700 hover:!border-gray-600"
                    onChange={({currentTarget}) => onInputChange(currentTarget)}
                    placeholder="Search for labels and titles..."
                    value={search}
                />
            </motion.div>
            <div className="!bg-gray-800 border border-transparent border-t-gray-700 border-b-gray-700 text-gray-300">
                <div className="btn-group !bg-gray-800 flex !justify-between px-6">
                    {page === 1 ? (
                        <button 
                            className="btn !bg-gray-800 hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500"
                            disabled={true}
                        > 
                            <MdKeyboardDoubleArrowLeft size={18} />
                        </button>
                    ) : (
                        <Link 
                            className="btn !bg-gray-800 hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500"
                            onClick={() => handlePrevPageClick()}
                            to={baseURL + (page - 1)}
                        > 
                            <MdKeyboardDoubleArrowLeft size={18} />
                        </Link>
                    )}
                    <p className="!bg-gray-800 uppercase tracking-widest text-sm cursor-default my-auto">Page {page}</p>
                    {!hasNextPage ? (
                        <button 
                            className="btn !bg-gray-800 !border-transparent disabled:text-gray-500"
                            disabled={true}
                        >
                            <MdKeyboardDoubleArrowRight size={18} />
                        </button>
                    ) : (
                        <Link 
                            className="btn !bg-gray-800 hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500"
                            onClick={() => handleNextPageClick()}
                            to={baseURL + (page + 1)}
                        > 
                            <MdKeyboardDoubleArrowRight size={18} />
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}