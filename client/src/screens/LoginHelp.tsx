import noapLogo from '../assets/logo/logo-white-no-bg.png';
import { useForm } from 'react-hook-form';

type Props = {}

export default function LoginHelp({}: Props) {
  const { watch, handleSubmit, register } = useForm();

  // const getEmail = (data: any) => {

  // };

  return (
    <div className="!bg-gray-800 h-screen">
      <div className="flex flex-row justify-between w-screen bg-stone-900 pb-2">
        <img src={noapLogo} className='w-32 pl-5 pt-2' draggable={false}/> 
        <a
          className='text-gray-200 text-sm font-light tracking-widest uppercase pt-[8.5px] px-3 mr-5 mt-[9px] h-10 rounded-lg hover:!bg-red-700 border border-gray-500 transition duration-300 ease-out'
          href='/'
        >
          Sign In
        </a>
      </div>
      <div 
        className="flex flex-col lg:!w-[82%] md:!w-[70%] xxs:w-[80%] xl:!w-[60%] absolute top-[29%] xxs:top-[13%] lg:!left-[9%] md:!left-[14%] xxs:!left-[10%] sm:!left-[12%] xl:!left-[22%]"
      >
        <div className="text-gray-200 flex flex-col border border-gray-700 !bg-stone-900 rounded-lg shadow-2xl shadow-black">
          <div className="px-5 py-3 border border-transparent border-b-gray-700">
            <p className='text-xl lg:text-2xl font-light tracking-tighter'>Reset your password</p>
          </div>
          <div className="px-5 py-4 text-md flex flex-col lg:flex-row justify-between font-light">
            <div className="my-auto">
              <p> 
                Please, enter the email address that you used to sign in to Noap. 
                <br/><br/> 
                If the email associated with an account, you will recive a email code that will allow you to reset your password!
              </p>
            </div>
            <div className="flex flex-col !bg-stone-800 px-5 xl:px-7 xxs:px-0 py-5 rounded-lg mt-10 lg:mt-0 xxs:!bg-transparent xxs:!w-[100%] ml-0 lg:ml-4 xl:ml-3">
              <input 
                type="text" 
                className='sign-text-inputs bg-stone-600 text-gray-100 border-transparent active:border focus:border-gray-400 lg:!w-[350px]'
                placeholder='Email address'
              />
              <button 
                className='bg-red-700 hover:bg-red-800 rounded-full mt-4 py-2 text-sm uppercase tracking-widest '
              >
                Send
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 mx-auto">
          <p>© 2023 Noap.</p>
        </div>
      </div>
    </div>
  )
}