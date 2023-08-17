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
            <div className="overflow-hidden flex flex-col pt-2 bg-[#f8f8f8] dark:bg-[#0f1011] h-[100px]">
                <div className="flex flex-col mb-[4px]">
                    <div className="flex flex-row justify-between px-3 py-2 text-gray-900 dark:text-gray-300">
                        <div className="text-center flex flex-row space-x-1 px-2">
                        <span> <BsJournalText size={23} className="pt-1" /> </span>
                            <p className="text-xl">Notes</p>
                        </div>
                        <button 
                            className="sm:hidden"
                            onClick={() => setNavbar(!navbar)}
                        >
                            {!navbar ? <BsList size={29} /> : <BsXLg size={23} className="mb-[2px] mr-1 mt-1" />}
                        </button>
                    </div>
                    <div className="flex flex-row flex-wrap gap-x-1 justify-between px-3 py-2 max-w-screen text-gray-900 dark:text-gray-300">
                        <p className="pl-3 pt-1">{totalDocs} notes</p>
                        <div className="flex flex-row space-x-2">
                            <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> <BsFilter size={25}/> </div>
                            <div className="tooltip tooltip-left" data-tip="Search">
                                <button 
                                    type="button"
                                    className="hover:bg-[#dadada] dark:hover:!text-gray-900 px-1 py-1 rounded"
                                    onClick={() => handleSearchClick()}
                                >
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
                className={`bg-[#f8f8f8] dark:bg-[#0f1011] px-6 pb-2 hidden ${showSearch && "!grid"}`}
            >
                <input
                    className="sign-text-inputs bg-[#eeeff1] dark:bg-stone-900 dark:text-gray-300 text-gray-900 h-10 border !border-stone-400 hover:!border-gray-600 shadow-none"
                    onChange={({currentTarget}) => onInputChange(currentTarget)}
                    placeholder="Search for note names..."
                    value={search}
                />
            </motion.div>
            <div className="bg-[#eaeaea] dark:!bg-[#0f1011] border border-transparent border-t-stone-300 border-b-stone-300 dark:border-t-[#404040] dark:border-b-[#404040] text-gray-300">
                <div className="btn-group bg-[#f8f8f8] dark:!bg-[#0f1011] flex !justify-between px-6">
                    {page === 1 ? (
                        <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed"> 
                            <MdKeyboardDoubleArrowLeft size={18} className="cursor-not-allowed" />
                        </button>
                    ) : (
                        <Link 
                            className="btn bg-[#f8f8f8] dark:!bg-[#0f1011] hover:!bg-[#f8f8f8] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                            onClick={() => handlePrevPageClick()}
                            to={baseURL + (page - 1)}
                        > 
                            <MdKeyboardDoubleArrowLeft className="text-gray-900 dark:text-gray-300" />
                        </Link>
                    )}
                    <p className="bg-[#f8f8f8] text-gray-900 dark:text-gray-300 dark:!bg-[#0f1011] uppercase tracking-widest text-sm cursor-default my-auto">Page {page}</p>
                    {!hasNextPage ? (
                        <button className="btn !border-transparent !bg-inherit text-gray-500 cursor-not-allowed">
                            <MdKeyboardDoubleArrowRight size={18} className="cursor-not-allowed" />
                        </button>
                    ) : (
                        <Link 
                            className="btn bg-[#f8f8f8] dark:!bg-[#0f1011] hover:!bg-[#f8f8f8] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                            onClick={() => handleNextPageClick()}
                            to={baseURL + (page + 1)}
                        > 
                            <MdKeyboardDoubleArrowRight className="text-gray-900 dark:text-gray-300"  />
                        </Link>
                    )}
                </div>
            </div>
        </>
    )
}