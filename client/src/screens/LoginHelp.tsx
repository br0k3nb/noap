import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

import noapLogo from '../assets/logo/logo-white-no-bg.png';
import forgotPassword from '../assets/forgot-password.svg';

type Props = {}

export default function LoginHelp({}: Props) {
  const { watch, handleSubmit, register } = useForm();

  // const getEmail = (data: any) => {

  // };

  return (
    <div className="!bg-gray-800 h-screen overflow-scroll">
      <div className="flex flex-row justify-between w-screen bg-stone-900 pb-3 pt-1 fixed z-10">
        <img src={noapLogo} className='w-[8rem] pl-5 pt-2' draggable={false}/> 
        <a
          className='text-gray-200 text-sm font-light tracking-widest uppercase pt-[7.5px] px-3 mr-5 mt-[9px] h-9 rounded-full hover:!bg-red-700 border border-gray-500 hover:px-[0.86rem] transition-all duration-500 ease-in-out'
          href='/'
        >
          Sign In
        </a>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: -200 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}  
        className="flex lg:flex-row flex-col space-x-5 px-6 mx-auto max-w-xl lg:!max-w-6xl mt-28 xxs:mt-12"
      >
        <div className="flex flex-col mt-[4.2rem] w-full text-gray-300">
          <p className='text-3xl xxs:text-2xl font-light tracking-tight'>Forgot your password ? </p>
          <p className='text-xl xxs:text-lg font-light tracking-tight mt-2 text-gray-400'>Don't worry, we're gonna help you!</p>
          <div className="flex flex-col mt-10">
            <p className='text-lg xxs:text-[15px]'>
              To restore your password, you need to have access to the email address which you created the account with.
              <br/>
              <br/>
              We will send a verification code to the email address, and you just need to copy and paste on the code text box.
            </p>
          </div>
          <div className="mt-10 xxs:mt-5">
            <div className="flex flex-col py-5 rounded-lg mt-3 !max-w-3xl mx-auto">
              <input 
                type="text" 
                className='sign-text-inputs bg-stone-900 text-gray-300 border-transparent active:border focus:border-gray-400'
                placeholder='Email address'
              />
              <button 
                className='bg-red-700 hover:bg-red-800 rounded-full mt-4 py-2 text-sm uppercase tracking-widest hover:!text-[13px] transition-all duration-500 ease-in-out'
              >
                Send code
              </button>
            </div>
          </div>
        </div>
        <img src={forgotPassword} className='xxs:w-[90%] xxs:h-auto w-[600px] h-[620px] mt-0 xxs:mt-5 object-cover opacity-90' draggable={false}/>
      </motion.div>
      <div className="flex flex-row justify-center items-center mb-10 uppercase text-xs tracking-wide text-gray-300">
        <p>© 2023 Noap.</p>
      </div>
    </div> 
  )
}