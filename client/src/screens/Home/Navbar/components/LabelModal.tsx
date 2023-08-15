import { SetStateAction, Dispatch, useState, useContext } from 'react';
import { useForm, FieldValues, FieldArrayWithId } from 'react-hook-form';
import { HexColorPicker } from "react-colorful";

import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { BsThreeDotsVertical, BsSearch, BsFilter } from 'react-icons/bs';
import { AiFillTags } from 'react-icons/ai';

import Modal from '../../../../components/Modal';
import SvgLoader from '../../../../components/SvgLoader';
import { toastAlert } from '../../../../components/Alert/Alert';
import ConfirmationModal from '../../../../components/ConfirmationModal';

import { LabelsCtx } from '../../../../context/LabelCtx';

import { motion } from 'framer-motion';

import api from '../../../../services/api';

type Props = {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    userId: string;
    labels: FieldArrayWithId<Labels, "labels", "id">[];
}

type Label = {
    _id: string;
    name: string;
    color: string;
    fontColor: string;
    editName: string;
    outlined: string;
    default: string;
}

export default function LabelModal({ open, setOpen, userId, labels }: Props) {
    const [loader, setLoader] = useState(false);
    const [color, setColor] = useState("#0e63b9");
    const [fontColor, setFontColor] = useState("#ffffff");
    const [deleteModal, setDeleteModal] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('');
    const [editId, setEditId] = useState<string | null>(null);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState('');
    const [showGoBackButton, setShowGoBackButton] = useState(false);
    const [showDropDown, setShowDropDown] = useState<number | null>(null);
    const [createLabel, setCreateLabel] = useState<string | boolean>(false);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [goBackButtonAction, setGoBackButtonAction] = useState<any>({action: null});

    const { handleSubmit, register, formState, reset } = useForm<Label>();
    const { errors } = formState;

    const labelData = useContext(LabelsCtx);
    const { 
        setPageLabel, 
        setSearchLabel, 
        searchLabel, 
        fetchLabels, 
        removeLabels, 
        isFetching, 
        pageLabel, 
        hasNextPageLabel 
    } = labelData as any;

    const deviceScreenSize = innerWidth;

    const onAddNewLabelClick = () => {
        setCreateLabel(true);
        setShowGoBackButton(true);
        setGoBackButtonAction({
            action: () => {
                setCreateLabel(false);
                setGoBackButtonAction({ action: null })
            }
        });
    };

    const closeModal = () => {
        setOpen(false);
        setPageLabel(1);
        setSearchLabel('');
        setShowSearchBar(false);
        setTimeout(() => setCreateLabel(false), 500);
    };
    
    const openDeleteModal = (_id: string) => {
        setSelectedLabel(_id);
        setDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setDeleteModal(false);
        setSelectedLabel(null);
    };
        
    const addLabel = async ({ name }: FieldValues) => {
        setLoader(true);

        if(selectedStyle.length === 0) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label type!`,  timer: 3000 });
        }

        try {
            const newLabel = await api.post(`/label/add/${userId}`, { color, fontColor, name, selectedStyle });
            toastAlert({ icon: 'success', title: `${newLabel.data.message}`, timer: 3000 });
            
            setLoader(false);
            fetchLabels();
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: err.message, timer: 3000 });
        }
    };
    
    const deleteLabel = async () => {
        setLoader(true);
        
        if(!selectedLabel) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label to delete`, timer: 3000 });
        }
        
        try {
            const deleteL = await api.delete(`/label/delete/${selectedLabel}`)
            toastAlert({ icon: 'success', title: `${deleteL.data.message}`, timer: 3000 });
            setLoader(false);
            closeDeleteModal();
            
            const findLabel = labels?.find(({_id}) => _id === selectedLabel);
            removeLabels(labels?.indexOf(findLabel as any));
            fetchLabels();
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.message}`, timer: 3000 });
        }
    };

    const resetLabelInfoToEdit = (chip: Label) => {
        const { _id, name, color, fontColor } : any = labels?.find(({_id}) => _id === chip._id);
        
        reset({ editName: name });
        setEditId(_id);
        setColor(color);
        setSelectedStyle('');
        setFontColor(fontColor);
        setCreateLabel('edit');
        setShowGoBackButton(true);
        setGoBackButtonAction({
            action: () => {
                setCreateLabel(false);
                setGoBackButtonAction({action: null})
            }
        });
    };

    const editLabel = async ({ editName }: FieldValues) => {
        setLoader(true);

        if(!selectedStyle) {
            setLoader(false);
            return toastAlert({ icon: 'error', title: `Please, select a label type!`, timer: 3000 });
        }        
        
        try {
            const editL = await api.patch(`/label/edit/${userId}`, {
                name: editName,
                _id: editId,
                color,
                fontColor
            });

            setLoader(false);
            fetchLabels();
            toastAlert({ icon: 'success', title: `${editL.data.message}`, timer: 3000 });
        } catch (err: any) {
            setLoader(false);
            toastAlert({ icon: 'error', title: `${err.message}`, timer: 3000 });
        }
    };

    const modalProps = {
        open,
        setOpen,
        title: 'Labels',
        options: {
            onClose: closeModal,
            showGoBackButton: showGoBackButton,
            goBackButtonAction: goBackButtonAction.action,
            titleWrapperClassName: "px-6",
            modalWrapperClassName: `xxs:!w-[18rem] !px-0 !w-[23rem] max-h-none overflow-hidden`
        }
    };

    const hide = { opacity: 0, transitionEnd: { display: "none" } };
    const show = { opacity: 1, display: "block" };

    const onInputChange = (currentTarget: HTMLInputElement) => {
        setSearchLabel(currentTarget.value);
        setPageLabel(1);
    };

    const handleShowSearchBar = () => {
        setShowSearchBar(!showSearchBar);
        setSearchLabel('');
    };

    return (
        <>
            <Modal {...modalProps}>
                <>
                    {!createLabel ? (
                        <>
                            <div className="text-gray-300">
                                <div className="flex flex-row justify-between mb-3 px-6 my-4">
                                    <p className='text-base uppercase tracking-widest my-auto'>Your labels</p>
                                    <div className="flex flex-row space-x-2">
                                        <div className="px-1 py-1 rounded cursor-not-allowed text-gray-500"> 
                                            <BsFilter size={25}/> 
                                        </div>
                                        <div className="tooltip tooltip-left text-gray-100 before:text-[15px]" data-tip="Search">
                                            <div 
                                                className="px-[5px] pt-[4px] pb-[7px] hover:bg-gray-700 rounded-lg transition-colors duration-300 ease-in-out cursor-pointer" 
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
                                        className="sign-text-inputs bg-stone-900 text-gray-300 border border-gray-600    h-10 mb-2"
                                        onChange={({currentTarget}) => onInputChange(currentTarget)}
                                        placeholder="Search..."
                                        value={searchLabel}
                                    />
                                </motion.div>
                                {labels && labels?.length > 0 ? (
                                    <>
                                        {isFetching ? ( <SvgLoader options={{ showLoadingText: true, wrapperClassName: "!my-[70px]" }} /> ) : 
                                            (<div className="flex flex-col space-y-2 mt-4 text-sm w-[19.5rem] mx-auto xxs:!w-[15rem] !min-h-[9rem] max-h-[14.9rem] xxs:!max-h-[10.5rem] overflow-y-scroll overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-900">
                                                {labels?.map((chip: any, idx: number) => {
                                                    const { color, fontColor, name, type } = chip;

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
                                                            {/* <div className='tooltip tooltip-left xxs:before:bg-transparent' data-tip={ innerWidth > 640 ? "Actions" : "" }> */}
                                                                <div className="flex items-center justify-center cursor-pointer">
                                                                    <div className="dropdown dropdown-left">
                                                                        <label tabIndex={0} className='cursor-pointer'>
                                                                            <BsThreeDotsVertical size={16} onClick={() => setShowDropDown(idx)} /> 
                                                                        </label>
                                                                        <ul 
                                                                            tabIndex={0} 
                                                                            className="dropdown-content menu shadow rounded-box w-36 !bg-gray-900 dark:!bg-[#17181b] border border-gray-600"
                                                                            style={idx !== showDropDown ? { display: 'none' }: undefined}
                                                                        >
                                                                            <li className="text-xs uppercase tracking-widest">
                                                                                <a className="active:!bg-gray-600" onClick={() => resetLabelInfoToEdit(chip)}>
                                                                                    Edit label
                                                                                </a>
                                                                            </li>
                                                                            <li className="text-xs uppercase tracking-widest">
                                                                                <a id="delete" className="active:!bg-gray-600" onClick={() => openDeleteModal(chip._id)}>
                                                                                    Delete label
                                                                                </a>
                                                                            </li>
                                                                        </ul>
                                                                    </div>
                                                                {/* </div> */}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>    
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-4 items-center justify-center my-5 text-gray-500">
                                        <AiFillTags size={60} className='!mt-5'/>
                                        <p className='text-[13px] uppercase tracking-widest !mb-9 xxs:text-xs'>No labels were found!</p>
                                    </div>
                                )}
                            </div>
                            <div className="text-gray-300 px-5 my-1">
                                <div className=" !bg-gray-800 dark:!bg-[#0f1011] flex !justify-between">
                                    <button 
                                        className="btn !bg-gray-800 dark:!bg-[#0f1011] hover:!bg-gray-700/70 !border-transparent disabled:text-gray-500 transition-all duration-300 ease-in-out"
                                        disabled={pageLabel === 1 ? true : false}
                                        onClick={() => setPageLabel(pageLabel - 1)}
                                    > 
                                        <MdKeyboardDoubleArrowLeft size={18} />
                                    </button>
                                    <p className="!bg-gray-800 dark:!bg-[#0f1011] uppercase tracking-widest text-xs cursor-default my-auto">Page {pageLabel}</p>
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
                                <button  className='text-sm uppercase text-gray-200 rounded-full mt-5' onClick={() => onAddNewLabelClick()}>
                                    <span className='px-6 py-1 rounded-full transition-all duration-500 border border-transparent hover:text-[15px]'>
                                        Add a new label
                                    </span>
                                </button>
                            </div>
                        </>
                    ) : createLabel && createLabel !== 'edit' ? (
                        <div className="mt-5">
                            <div className="text-gray-200 px-6 mb-3">
                                <p className='text-lg tracking-tight font-light'>
                                    Add a new label
                                </p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest'>
                                    First, select the type of the label
                                </p>

                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
                                        onClick={() => setSelectedStyle('default')}
                                    />
                                    <div className="ml-6">
                                        <div 
                                            className="badge badge-accent !py-3 uppercase text-xs tracking-widest"
                                            style={{ backgroundColor: color, borderColor: color, color: fontColor }}
                                        >
                                            first style
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400"
                                        onClick={() => setSelectedStyle('outlined')}
                                    />
                                    <div className="ml-6">
                                        <div 
                                            className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest"
                                            style={{ borderColor: color, color: color }}
                                        >
                                            second style
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={`mt-6 !mb-0 `}>
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest px-6'>
                                    Now, enter the label details
                                </p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <form noValidate onSubmit={handleSubmit(addLabel)}>
                                        <div className="px-6">
                                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                                {errors.name?.message as string}
                                            </p>
                                            <input
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                {...register("name", { required: "Name is required!" })}
                                            />   
                                    
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button type='button' className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: color }}>
                                                        <span className='text-gray-900 px-8' onClick={() => setShowColorPicker('color')} style={{ color }} />
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle === 'default' && window.innerWidth <= 639 ? { top: '18rem'} 
                                                        : selectedStyle === 'default' && window.innerWidth > 639 ? { top: '16rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button type='button' className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'>
                                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button type='button' className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: fontColor }}>
                                                            <span className='px-8' style={{ color: fontColor }} onClick={() => setShowColorPicker('fontColor')} />
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle !== 'default' && window.innerWidth <= 639 ? { top: '16rem' } 
                                                        : selectedStyle !== 'default' && window.innerWidth > 639 ? { top: '14rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button type='button' className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4'>
                                                            <span className='xxs:py-2 py-1 bg-black rounded-full px-10' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-5 text-gray-100 !px-0'>
                                            <div className='border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                                                <button 
                                                    type={loader ? 'button' : 'submit'}
                                                    className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'
                                                >
                                                    {!loader ? ("Create label"): (<SvgLoader options={{ showLoadingText: true }}/>)}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5">
                            <div className="text-gray-200 px-6 mb-3">
                                <p className='text-lg tracking-tight font-light'>Edit label</p>
                            </div>
                            <div className="flex flex-col px-6 space-y-3">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest'>First, select the type of the label</p>
                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
                                        onClick={() => setSelectedStyle('default')}
                                    />
                                    <div className="ml-6">
                                        <div className="badge badge-accent !py-3 uppercase text-xs tracking-widest" style={{ backgroundColor: color, borderColor: color, color: fontColor }}>
                                            first style
                                        </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    <input 
                                        type="radio" 
                                        name="radio-1" 
                                        className="radio !bg-gray-600 !border-gray-400" 
                                        onClick={() => setSelectedStyle('outlined')}
                                    />
                                    <div className="ml-6">
                                        <div className="badge badge-accent badge-outline !py-3 uppercase text-xs tracking-widest" style={{ borderColor: color, color: color }}>
                                            second style
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 !mb-0">
                                <p className='text-sm text-gray-400 !mb-4 uppercase tracking-widest px-6'>Now, enter the label details</p>
                                <div className="mt-2 flex flex-col space-y-4">
                                    <form noValidate onSubmit={handleSubmit(editLabel)}>
                                        <div className="px-6">
                                            <p className="text-red-500 ml-1 !mb-2 uppercase text-xs tracking-widest">
                                                {errors.editName?.message as string}
                                            </p>
                                            <input
                                                className={`sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400 ${errors.name?.message && 'border border-red-600 focus:border-red-600 active:border-red-600'}`}
                                                placeholder="Name"
                                                {...register("editName", { required: "Name is required!" })}
                                            />   
                                            <div className="flex flex-col space-y-3 mt-5 !text-gray-400">
                                                <label className='text-xs uppercase tracking-widest'>
                                                    Pick a color: {""} 
                                                    <button type="button" className="rounded-full ml-1 border border-gray-400 w-fit py-[1px]" style={{ backgroundColor: color }}>
                                                        <span className='text-gray-900 px-8' onClick={() => setShowColorPicker('color')} style={{ color }} />
                                                    </button>
                                                </label>
                                                {showColorPicker === 'color' && (
                                                    <div 
                                                        className="absolute xxs:top-[16rem] xxs:left-[3rem] top-[14rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle === 'default' && window.innerWidth <= 639 ? { top: '18rem' } 
                                                        : selectedStyle === 'default' && window.innerWidth > 639 ? { top: '16rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={color} onChange={setColor} />
                                                        <button type="button" className="text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4">
                                                            <span className='xxs:py-2 py-1 rounded-full px-10 bg-black text-gray-100' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                                {selectedStyle === 'default' && (
                                                    <label className='text-xs uppercase tracking-widest'>
                                                        Pick a text color: {""} 
                                                        <button type="button" className='rounded-full ml-1 border border-gray-400 w-fit py-[1px]' style={{ backgroundColor: fontColor }}>
                                                            <span className="px-8" onClick={() => setShowColorPicker('fontColor')} style={{ color: fontColor }} />
                                                        </button>
                                                    </label>
                                                )}
                                                {showColorPicker === 'fontColor' && (
                                                    <div 
                                                        className="absolute xxs:top-[18rem] xxs:left-[3rem] top-[16rem] left-[5.4rem] flex flex-col"
                                                        style={ selectedStyle !== 'default' && window.innerWidth <= 639 ? { top: '16rem'} 
                                                        : selectedStyle !== 'default' && window.innerWidth > 639 ? { top: '14rem' } : undefined }
                                                    >
                                                        <HexColorPicker color={fontColor} onChange={setFontColor} />
                                                        <button className='text-sm uppercase tracking-widest rounded-full mx-auto my-2 xxs:!mt-4' type='button'>
                                                            <span className='xxs:py-2 py-1 bg-black rounded-full px-10' onClick={() => setShowColorPicker('')}>
                                                                close
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className='mt-5 text-gray-100 !px-0 border border-transparent border-t-gray-600 w-full flex justify-center items-center pt-3'>
                                            <button  type={loader ? 'button' : 'submit'} className='text-sm uppercase tracking-widest rounded-full px-8 pt-2 transition-all hover:text-[15px] duration-500'>
                                                {!loader ? ("Edit label"): (<SvgLoader options={{ showLoadingText: true }}/>)}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}   
                </>
            </Modal>
            <ConfirmationModal
                open={deleteModal}
                setOpen={setDeleteModal}
                deleteButtonAction={deleteLabel}
                mainText='Are you sure you want to delete this label?'
                options={{ loader, onClose: closeDeleteModal, modalWrapperClassName: "!w-96 xxs:!w-80", mainTextCustomClassName: "xxs:text-xs" }}
            />
        </>
    )
}