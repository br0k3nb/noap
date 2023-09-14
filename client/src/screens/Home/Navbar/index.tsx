import { useState, useContext } from 'react';
import { FieldArrayWithId } from 'react-hook-form';

import { 
  BsJournalPlus, 
  BsTagFill,
  BsGearWide, 
} from "react-icons/bs";

import { motion } from 'framer-motion';

import useUpdateViewport from '../../../hooks/useUpdateViewport';
import useAuth from '../../../hooks/useAuth';

import { UserDataCtx } from '../../../context/UserDataContext';

import ConfirmationModal from '../../../components/ConfirmationModal';
import SettingsModal from './components/SettingsModal';
import SvgLoader from '../../../components/SvgLoader';
import LabelModal from './components/LabelModal';

import logo from '../../../assets/logo/logo-white-no-bg.png';
import logoN from '../../../assets/logo/logo-white-no-bg-just-N.png';

type NavProps = {
  labels: FieldArrayWithId<Labels, "labels", "id">[];
  addNewNote: () => Promise<void>;
  showSvgLoader: boolean;
  expanded: boolean;
  navbar: boolean;
};

export default function Nav({ navbar, showSvgLoader, addNewNote, expanded, labels }: NavProps) {
  const [openLabelModal, setOpenLabelModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [openSignOutConfirmationModal, setOpenSignOutConfirmationModal] = useState(false);
  const [deviceScreenSize, setDeviceScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const auth = useAuth();
  useUpdateViewport(setDeviceScreenSize, 500);

  const { userData: { _id, settings: { theme }} } = useContext(UserDataCtx) as any;

  const hide = { x: -140, transitionEnd: { display: "none" }};
  const show = { display: "block", x: 0 };

  return (
    <div className={`${expanded && "hidden"}`}>
      <LabelModal 
        open={openLabelModal} 
        userId={ _id } 
        setOpen={setOpenLabelModal} 
        labels={labels}
      />
      <ConfirmationModal
        open={openSignOutConfirmationModal}
        setOpen={setOpenSignOutConfirmationModal}
        actionButtonFn={() => auth.signOut()}
        mainText='Are you sure you want to sign out ?'
        options={{ 
          actionButtonText: "Sign out",
          modalWrapperClassName: "!w-96",
          mainTextClassName: "text-center text-[14px] font-light",
          cancelButtonText: "Go back"
        }}
      />
      <SettingsModal
        open={openSettingsModal}
        setOpen={setOpenSettingsModal}
      />
      {deviceScreenSize.width > 640  ? ( 
          <div className={`fixed ${!navbar && "flex xxs:hidden"}`}>
            <div 
              id="pc-navbar" 
              className="text-gray-900 dark:text-gray-300 flex flex-col items-center w-[60px] h-screen overflow-hidden bg-[#eeeff1] dark:!bg-[#1c1d1e] border border-transparent !border-r-stone-300 dark:!border-r-[#404040] justify-end"
            >
              <div className="flex items-center justify-center w-11 h-11 pb-1 mt-auto hover:text-gray-300 absolute top-6">
                <div className="rounded-full border border-stone-400 dark:!border-[#424242] bg-[#e2e2e2] dark:!bg-[#242424] dark:hover:!bg-[#181818] hover:bg-[#d1d1d1] text-lg w-[2.75rem] h-[2.75rem] transition-all duration-500 ease-in-out">
                  <img src={logoN} className={`h-5 w-5 mx-auto mt-[10.5px] ${theme !== 'dark' && "comp-picker"}`}/>
                </div>
              </div>
              <div className="!bg-gray-600 h-1 w-1 rounded-full absolute top-[98px]"/>
              <div className="flex flex-col items-center absolute top-28">
                <div
                  className={`tooltip tooltip-right tooltip-right-color-controller ${showSvgLoader && 'tooltip-open'}`}
                  data-tip={`${showSvgLoader ? "Adding note..." : "Add new note"}`}
                >
                  <a
                    className="flex items-center justify-center w-[60px] h-12 mt-2 dark:hover:!bg-[#323232] hover:bg-[#bebebe] hover:text-gray-300 border border-transparent border-r-stone-300 dark:border-r-[#404040]"
                    onClick={() => addNewNote()}
                  >
                    {showSvgLoader ? ( 
                        <SvgLoader options={{ showLoadingText: false, wrapperClassName: "pl-3" }} /> 
                      ) : ( 
                        <BsJournalPlus className="text-black dark:text-gray-300" size={23}/>
                      )
                    }
                  </a>
                </div>
                <div 
                  className="tooltip tooltip-right tooltip-right-color-controller"
                  data-tip="Labels"
                >
                  <a
                    className="flex items-center justify-center w-[60px] h-12 mt-2 dark:hover:!bg-[#323232] hover:bg-[#bebebe] hover:text-gray-300 border border-transparent border-r-stone-300 dark:border-r-[#404040]"
                    onClick={() => setOpenLabelModal(true)}
                  >
                    <BsTagFill className="text-black dark:text-gray-300" size={23} />
                  </a>
                </div>
                {/* <button
                  className="flex items-center justify-center w-[60px] h-12 mt-2 dark:hover:!bg-[#323232] hover:bg-[#bebebe] hover:text-gray-300 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <BsFillCalendarEventFill className="text-gray-900/80 dark:text-gray-300" size={22} />
                </button>
                <button
                  className="flex items-center justify-center w-[60px] h-12 mt-2 dark:hover:!bg-[#323232] hover:bg-[#bebebe] hover:text-gray-300 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <BsFillTrashFill className="text-gray-900/80 dark:text-gray-300" size={22} />
                </button> */}
                <div className="tooltip tooltip-right tooltip-right-color-controller" data-tip="Settings">
                  <button
                    className="flex items-center justify-center w-[60px] h-12 mt-2 dark:hover:!bg-[#323232] hover:bg-[#bebebe] hover:text-gray-300 border border-transparent border-r-stone-300 dark:border-r-[#404040]"
                    onClick={() => setOpenSettingsModal(true)}
                  >
                    <BsGearWide className="text-black dark:text-gray-300" size={22} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : ( 
          <motion.div 
            initial={{ x: -100 }}
            animate={!navbar ? hide : show}
            transition={{ duration: 0.3 }}
            className={`
              fixed 
              ${!navbar && "flex xxs:hidden"} 
              bg-[#eeeff1] text-gray-900 dark:bg-[#1c1d1e] dark:!text-gray-300 border border-transparent border-t-gray-800 border-r-gray-800 dark:border-t-[#404040] dark:border-r-[#404040] z-50 rounded-tr-3xl
            `}
            style={{ height: deviceScreenSize.height }}
          >
            <div className="flex flex-col w-[150px] overflow-hidden">
              <div className="mx-auto mt-6">
                <img 
                  src={logo} 
                  className={`w-[105px] h-[39px] ${theme !== 'dark' && 'comp-picker'}`} 
                /> 
              </div>
              <div className="!bg-gray-600 h-1 w-1 rounded-full mx-auto my-6" />
              <div className="flex flex-col">
                <a 
                  className="py-2 rounded px-6" 
                  onClick={() => addNewNote()}
                >
                  {
                    showSvgLoader ? ( 
                      <SvgLoader 
                        options={{ 
                          showLoadingText: true,
                          LoadingTextClassName: '!text-[11px]'
                        }} 
                      /> 
                    ) : ( 
                      <div className="flex flex-row cursor-pointer">
                        <BsJournalPlus size={20} /> 
                        <p className='ml-2 text-xs uppercase tracking-widest mt-[2px]'>New note</p>
                      </div>
                    )
                  }
                </a>
                <div className="!bg-gray-600 h-[1px] w-[2.50rem] my-3 mx-auto" />
                <a 
                  className="py-2 rounded px-6" 
                  onClick={() => setOpenLabelModal(true)}
                >
                  <div className="flex flex-row space-x-2 cursor-pointer">
                    <BsTagFill size={20} />
                    <p className='ml-2 text-[13px] uppercase tracking-widest'>Labels</p>
                  </div>
                </a>
                <div className="!bg-gray-600 h-[1px] w-[2.50rem] my-3 mx-auto"/>
                {/* <button
                  className="w-16 h-12 hover:bg-gray-700 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex flex-row text-gray-400">
                    <BsFillCalendarEventFill className="text-gray-300/60" size={22} />
                    <p className='ml-2 my-auto text-xs uppercase tracking-widest'>Events</p>
                  </div>
                </button>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/>
                <button
                  className="w-16 h-12 hover:bg-gray-700 disabled:!bg-transparent disabled:cursor-not-allowed"
                  disabled={true}
                >
                  <div className="flex flex-row text-gray-400">
                    <BsFillTrashFill className="text-gray-300/60" size={22} />
                    <p className='ml-2 my-auto text-xs uppercase tracking-widest'>Trash</p>
                  </div>
                </button>
                <div className="!bg-gray-600 h-[1px] w-[20%] rounded-full my-2"/> */}
                <button
                  className="py-2 rounded px-6"
                  onClick={() => setOpenSettingsModal(true)}
                >
                  <div className="flex flex-row">
                    <BsGearWide size={20} />
                    <p className='ml-2 text-[13px] uppercase tracking-widest'>Settings</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )
      }
    </div>
  );
}