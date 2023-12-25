import { FieldArrayWithId } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";

import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { BsThreeDotsVertical, BsSearch, BsFilter } from 'react-icons/bs';
import { AiFillTags } from 'react-icons/ai';

import { motion } from "framer-motion";

type Props = {
    labels: FieldArrayWithId<Labels, "labels", "id">[];    
    resetLabelInfoToEdit: (label: FieldArrayWithId<Labels, "labels", "id">) => void;
    openDeleteModal:  (_id: string) => void;
    showSearchBar: boolean;
    setShowSearchBar: Dispatch<SetStateAction<boolean>>;
    onAddNewLabelClick: () => void;
}

import SvgLoader from "../../../../../components/SvgLoader";
import useLabel from "../../../../../hooks/useLabel";

export default function ListLabels({ 
    labels,
    resetLabelInfoToEdit,
    openDeleteModal,
    showSearchBar,
    setShowSearchBar,
    onAddNewLabelClick
}: Props) {
    const [showDropdown, setShowDropdown] = useState<number | null>(null);

    const {
        searchLabel,
        isFetching,
        pageLabel,
        hasNextPageLabel,
        dispatchLabels
    } = useLabel();

    const deviceScreenSize = innerWidth;

    const hide = { opacity: 0, transitionEnd: { display: "none" } };
    const show = { opacity: 1, display: "block" };

    const onInputChange = (currentTarget: HTMLInputElement) => {
        dispatchLabels({
            type: "PAGE_AND_SEARCH",
            payload: {
                search: currentTarget.value,
                page: 1
            }
        });
    };

    const handleShowSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        dispatchLabels({ type: "SEARCH", payload: "" });
    };

    return (
       <>
            <div className="dark:text-gray-300 text-gray-900">
                <div className="flex flex-row justify-between mb-3 px-6 my-4">
                    <p className='text-base uppercase tracking-widest my-auto'>Your labels</p>
                    <div className="flex flex-row space-x-2">
                        <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> 
                            <BsFilter size={25}/> 
                        </div>
                        <div className="tooltip tooltip-left tooltip-left-color-controller before:!mr-[5px] after:!mr-[3px] before:text-[15px]" data-tip="Search">
                            <div 
                                className="px-[5px] pt-[4px] pb-[7px] hover:bg-[#dadada] dark:hover:bg-stone-600 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer" 
                                onClick={() => handleShowSearchBar()}
                            >
                                <BsSearch size={22} className="pt-[4px] cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
                <motion.div
                    animate={!showSearchBar ? hide : show}
                    transition={{ duration: 0.4 }}
                    className={`hidden ${showSearchBar && "!grid"} px-6`}
                >
                    <input
                        className="sign-text-inputs bg-[#eeeff1] dark:bg-[#1c1d1e] border border-stone-400 dark:border-[#404040] h-10 mb-2 shadow-none"
                        onChange={({currentTarget}) => onInputChange(currentTarget)}
                        placeholder="Search..."
                        value={searchLabel}
                    />
                </motion.div>
                {isFetching ? (
                    <SvgLoader options={{ showLoadingText: true, wrapperClassName: "!my-[70px] !mr-4" }} />
                ) : !isFetching && labels.length ? (
                    <div className="flex flex-col space-y-2 mt-4 text-sm w-[19.5rem] mx-auto xxs:!w-[15rem] h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
                        {labels.map((label, idx: number) => {
                            const { color, fontColor, name, type } = label;

                            return (                                        
                                <div className="flex space-x-2 justify-between pr-2" key={idx}>
                                    {type === 'outlined' ? (
                                        <div 
                                            className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate"
                                            style={{ borderColor: color, color }}
                                        >
                                            {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                            : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,17) + '...' : name}
                                        </div>
                                    ) : (
                                        <div 
                                            className="badge badge-accent !py-3 uppercase text-xs tracking-widest"
                                            style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                                        >
                                            {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                            : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,17) + '...' : name}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center cursor-pointer">
                                        <div className="dropdown dropdown-left">
                                            <label tabIndex={0} className='cursor-pointer'>
                                                <BsThreeDotsVertical size={16} onClick={() => setShowDropdown(idx)} /> 
                                            </label>
                                            <ul 
                                                tabIndex={0} 
                                                className="dropdown-content menu shadow rounded-box w-[150px] dark:!bg-[#17181b] bg-[#ffffff] border border-gray-600"
                                                style={idx !== showDropdown ? { display: 'none' }: undefined}
                                            >
                                                <li className="text-xs uppercase tracking-widest">
                                                    <a className="active:!bg-inherit" onClick={() => resetLabelInfoToEdit(label)}>
                                                        Edit label
                                                    </a>
                                                </li>
                                                <li className="text-xs uppercase tracking-widest">
                                                    <a id="delete" className="active:!bg-inherit" onClick={() => openDeleteModal(label._id)}>
                                                        Delete label
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4 items-center justify-center h-[12.8rem] text-gray-500">
                        <AiFillTags size={60} className='!mt-5'/>
                        <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>
                            No labels were found!
                        </p>
                    </div>
                )}
            </div>
            <div className="px-5 my-1">
                <div className="dark:!bg-[#0f1011] flex !justify-between">
                    <button 
                        className="text-gray-900 dark:text-gray-300 disabled:text-gray-400 btn !bg-[#ffffff] dark:!bg-[#0f1011] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                        disabled={pageLabel === 1 ? true : false}
                        onClick={() => dispatchLabels({ type: "PAGE", payload: pageLabel - 1 })}
                    > 
                        <MdKeyboardDoubleArrowLeft />
                    </button>
                    <p className="dark:!bg-[#0f1011] uppercase tracking-widest text-xs cursor-default my-auto">
                        Page {pageLabel}
                    </p>
                    <button 
                        className="text-gray-900 dark:text-gray-300 disabled:text-gray-400 btn !bg-[#ffffff] dark:!bg-[#0f1011] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                        disabled={hasNextPageLabel ? false : true}
                        onClick={() => dispatchLabels({ type: "PAGE", payload: pageLabel + 1 })}
                    >
                        <MdKeyboardDoubleArrowRight />
                    </button>
                </div>
            </div>
            <div className="flex justify-center items-center border border-transparent border-t-gray-600">
                <button 
                    className='text-sm uppercase rounded-full mt-5' 
                    onClick={() => onAddNewLabelClick()}
                >
                    <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent hover:text-[15px]'>
                        Add a new label
                    </span>
                </button>
            </div>
       </>
    )
}