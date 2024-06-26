import { useState, SetStateAction, Dispatch } from 'react';
import { FieldArrayWithId, FieldValues, UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';

import { BsSearch, BsFilter } from 'react-icons/bs';
import { AiFillTags } from 'react-icons/ai';

import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";

import api from '../../../services/api';

import useRefetch from '../../../hooks/useRefetch';
import useLabel from '../../../hooks/useLabel';

import { toastAlert } from '../../../components/Alert';
import SvgLoader from '../../../components/SvgLoader';
import Tooltip from '../../../components/Tooltip';
import Modal from '../../../components/Modal';

import { motion } from 'framer-motion';

type Props = {
    checked: boolean;
    isFetching: boolean;
    register: UseFormRegister<FieldValues>;
    selectedNote: string | null;
    setChecked: Dispatch<SetStateAction<boolean>>;
    handleSubmit: UseFormHandleSubmit<FieldValues>;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

export default function SelectLabelModal({ labels, checked, setChecked, isFetching, selectedNote, register, handleSubmit }: Props) {
    
    const [showLoader, setShowLoader] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    
    const { 
        dispatchLabels,
        searchLabel, 
        pageLabel, 
        hasNextPageLabel 
    } = useLabel();

    const { fetchNotes, fetchSelectedNote } = useRefetch();

    const addLabel = async (data: FieldValues) => {
        setShowLoader(true);

        try {
            const labels = [];

            for (const [key, value] of Object.entries(data)) {
                value && labels.push(key);
            }

            const { data: { message } } = await api.post(`/note/add/label`, { labels, noteId: selectedNote });
            
            toastAlert({ icon: "success", title: message, timer: 2000 });

            fetchNotes();
            if(fetchSelectedNote) fetchSelectedNote();
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            console.log(err);
        } finally {
            setShowLoader(false);
        }
    };

    const modalProps = {
        open: checked,
        setOpen: setChecked,
        title: "Select a label",
        options: { 
            titleWrapperClassName: 'px-6', 
            modalWrapperClassName: `
                !px-0 xxs:!w-[18rem] max-h-[29.5rem] w-[24rem] overflow-hidden
                ${showSearchBar && "!max-h-[33.2rem]"}
            ` 
        }
    };

    const deviceScreenSize = window.innerWidth;

    const onInputChange = (currentTarget: HTMLInputElement) => {
        dispatchLabels({ 
            type: "PAGE_AND_SEARCH", 
            payload: {
                page: 1,
                search: currentTarget.value
            }
        })
    };

    const handleShowSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        dispatchLabels({ type: "SEARCH", payload: "" });
    };

    const hide = { opacity: 0, transitionEnd: { display: "none" } };
    const show = { opacity: 1, display: "block" };

    return (
        <Modal {...modalProps}>
            <div className="mb-8 mt-5 text-gray-900 dark:text-gray-300">
                <div className="flex flex-row justify-between mb-3 px-6 my-4">
                    <p className='text-base uppercase tracking-widest my-auto'>Your labels</p>
                    <div className="flex flex-row space-x-2">
                        <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> 
                            <BsFilter size={25}/> 
                        </div>
                        <Tooltip position='left' customClassName=' before:!mr-[5px] after:!mr-[3px] before:text-[15px]' text='Search'>
                            <div
                                className="px-[5px] pt-[4px] pb-[7px] hover:bg-[#dadada] dark:hover:bg-stone-600 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer"
                                onClick={() => handleShowSearchBar()}
                            >
                                <BsSearch size={22} className="pt-[4px] cursor-pointer" />
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <motion.div
                    animate={!showSearchBar ? hide : show}
                    transition={{ duration: 0.4 }}
                    className={`bg-inhreit dark:!bg-[#0f1011] hidden ${showSearchBar && "!grid"} px-6`}
                >
                    <input
                        className="text-gray-900 dark:text-gray-300 sign-text-inputs shadow-none bg-[#eeeff1] dark:bg-[#1c1d1e] border border-stone-400 dark:border-[#404040] h-10 mb-2"
                        onChange={({currentTarget}) => onInputChange(currentTarget)}
                        placeholder="Search..."
                        value={searchLabel}
                    />
                </motion.div>
                {isFetching ? <SvgLoader options={{ showLoadingText: true, wrapperClassName: "my-36" }} /> : labels.length > 0 ? (
                    <form onSubmit={handleSubmit(addLabel)}>
                        <div className="flex flex-col mt-4 text-sm px-1 h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin  scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-300">
                            {labels.map((chip: any, idx: number) => {
                                const { color, fontColor, name, _id, type } = chip;
                                
                                return (                                        
                                    <div 
                                        key={idx}
                                        className={`flex justify-between px-6 ${idx === labels.length - 1 && "mb-5"}`} 
                                    >
                                        <div className="my-auto">
                                            {type === 'outlined' ? (
                                                <div 
                                                    className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate" 
                                                    style={{ borderColor: color, color }}
                                                >
                                                    {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                                    : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,15) + '...' : name}
                                                </div>
                                            ) : (
                                                <div 
                                                    className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate" 
                                                    style={{ backgroundColor:color, borderColor: color, color: fontColor }}
                                                >
                                                    {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                                    : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,15) + '...' : name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer">
                                                <input
                                                    type="checkbox" 
                                                    className="checkbox !h-5 !w-5 border-gray-600" 
                                                    {...register(_id)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="px-5 mt-2">
                            <div className=" !bg-[#ffffff] dark:!bg-[#0f1011] flex !justify-between">
                                <button
                                    type='button'
                                    className="text-gray-900 dark:text-gray-300 disabled:text-gray-400 btn !bg-[#ffffff] dark:!bg-[#0f1011] !border-transparent text-lg transition-all duration-300 ease-in-out hover:!text-2xl"
                                    disabled={pageLabel === 1 ? true : false}
                                    onClick={() => dispatchLabels({ type: "PAGE", payload: pageLabel - 1 })}
                                > 
                                    <MdKeyboardDoubleArrowLeft />
                                </button>
                                <p className="text-gray-900 dark:text-gray-300 !bg-[#ffffff] dark:!bg-[#0f1011] uppercase tracking-widest text-xs cursor-default my-auto">
                                    Page {pageLabel}
                                </p>
                                <button 
                                    type='button'
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
                                type='submit' 
                                className='text-sm uppercase  text-gray-900 dark:text-gray-300 rounded-full mt-5'
                            >
                            {!showLoader ? (
                                <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent hover:text-[15px] hover:tracking-widest'>
                                    Attach labels
                                </span>
                            ) : (
                                <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent animate-pulse tracking-wide'>
                                    Attaching labels...
                                </span>
                            )}
                            </button>
                        </div>
                    </form>   
                ) : (
                    <div className="flex flex-col space-y-4 items-center justify-center my-10 text-gray-500">
                        <AiFillTags size={60} className='!mt-5'/>
                        <p className='text-gray-900 dark:text-gray-300 text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>
                            No labels were found!
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    )
}