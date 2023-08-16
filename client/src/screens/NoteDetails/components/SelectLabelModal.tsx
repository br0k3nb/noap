import { useState, SetStateAction, Dispatch, useContext } from 'react';
import { FieldArrayWithId, FieldValues, UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';

import { BsSearch, BsFilter } from 'react-icons/bs';
import { AiFillTags } from 'react-icons/ai';

import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";

import api from '../../../services/api';

import { toastAlert } from '../../../components/Alert/Alert';
import { RefetchCtx } from '../../../context/RefetchCtx';
import { LabelsCtx } from '../../../context/LabelCtx';
import SvgLoader from '../../../components/SvgLoader';
import Modal from '../../../components/Modal';

import { motion } from 'framer-motion';

type Props = {
    checked: boolean;
    isFetching: boolean;
    register: UseFormRegister<FieldValues>;
    selectedNote: string | null | undefined;
    setChecked: Dispatch<SetStateAction<boolean>>;
    handleSubmit: UseFormHandleSubmit<FieldValues>;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

export default function SelectLabelModal({ labels, checked, setChecked, isFetching, selectedNote, register, handleSubmit }: Props) {
    const refetch = useContext(RefetchCtx);

    const [showLoader, setShowLoader] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);

    const labelData = useContext(LabelsCtx);
    const { 
        setPageLabel, 
        setSearchLabel, 
        searchLabel, 
        pageLabel, 
        hasNextPageLabel 
    } = labelData as any;

    const addLabel = async (data: FieldValues) => {
        setShowLoader(true);

        try {
            const labels = [];

            for (const [key, value] of Object.entries(data)) value && labels.push(key);

            if(!labels.length) {
                setShowLoader(false);    
                return toastAlert({ icon: "error", title: `Please, select a label!`, timer: 2000 });
            };

            const { data: { message } } = await api.post(`/note/add/label`, { labels, noteId: selectedNote });
            
            toastAlert({icon: "success", title: message, timer: 2000});
            await refetch?.fetchNotes();
            setShowLoader(false);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err.message, timer: 2000 });
            setShowLoader(false);
            console.log(err);
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
        setSearchLabel(currentTarget.value);
        setPageLabel(1);
    };

    const handleShowSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        setSearchLabel('');
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
                        <div className="tooltip tooltip-left text-gray-900 dark:text-gray-300 before:text-[15px]" data-tip="Search">
                            <div 
                                className="px-[5px] pt-[4px] pb-[7px] hover:bg-[#c1c1c1] dark:hover:bg-gray-700 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer" 
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
                    className={`bg-inhreit dark:!bg-[#0f1011] hidden ${showSearchBar && "!grid"} px-6`}
                >
                    <input
                        className="sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 h-10 mb-2"
                        onChange={({currentTarget}) => onInputChange(currentTarget)}
                        placeholder="Search..."
                        value={searchLabel}
                    />
                </motion.div>
                {isFetching ? <SvgLoader options={{ showLoadingText: true, wrapperClassName: "my-36" }} /> : labels.length > 0 ? (
                    <form onSubmit={handleSubmit(addLabel)}>
                        <div className="flex flex-col mt-4 text-sm px-1 h-[12.8rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                            {labels.map((chip: any, idx: number) => {
                                const { color, fontColor, name, _id, type } = chip;
                                
                                return (                                        
                                    <div className={`flex justify-between px-6 ${idx === labels.length - 1 && "mb-5"}`} key={idx}>
                                        <div className="my-auto">
                                            {type === 'outlined' ? (
                                                <div className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest truncate" style={{ borderColor: color, color }}>
                                                    {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                                    : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,17) + '...' : name}
                                                </div>
                                            ) : (
                                                <div className="badge badge-accent !py-3 uppercase text-xs tracking-widest truncate" style={{ backgroundColor:color, borderColor: color, color: fontColor }}>
                                                    {(name.length > 24 && deviceScreenSize > 640) ? name.slice(0,24) + '...' 
                                                    : (name.length > 17 && deviceScreenSize <= 640) ? name.slice(0,17) + '...' : name}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-control">
                                            <label className="label cursor-pointer">
                                                <input
                                                    type="checkbox" 
                                                    className="checkbox !h-5 !w-5" 
                                                    {...register(_id)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="text-gray-300 px-5 mt-2">
                            <div className=" !bg-gray-800 dark:!bg-[#0f1011] flex !justify-between">
                                <button 
                                    className="btn !bg-gray-800 dark:!bg-[#0f1011] hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500 transition-all duration-300 ease-in-out"
                                    disabled={pageLabel === 1 ? true : false}
                                    onClick={() => setPageLabel(pageLabel - 1)}
                                > 
                                    <MdKeyboardDoubleArrowLeft size={18} />
                                </button>
                                <p className="!bg-gray-800 dark:!bg-[#0f1011] uppercase tracking-widest text-xs cursor-default my-auto">
                                    Page {pageLabel}
                                </p>
                                <button 
                                    className="btn !bg-gray-800 dark:!bg-[#0f1011] hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500 transition-all duration-300 ease-in-out"
                                    disabled={hasNextPageLabel ? false : true}
                                    onClick={() => setPageLabel(pageLabel + 1)}
                                >
                                    <MdKeyboardDoubleArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center items-center border border-transparent border-t-gray-600">
                            <button 
                                type='submit' 
                                className='text-sm uppercase  text-gray-900 dark:text-gray-300 rounded-full mt-5'
                            >
                            {!showLoader ? (
                                <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent hover:text-[15px]'>
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
                        <p className='text-gray-900 dark:text-gray-300 text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>No labels were found!</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}