import error404 from '../assets/error404.png';
import { motion } from 'framer-motion';

export default function Page404() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 h-screen overflow py-20 items-center flex justify-center flex-col md:gap-28 gap-16"
    >
      <div className="max-w-xl px-6">
        <img src={error404} className='w-full pt-10 object-cover' />        
        <div className="px-4 text-gray-100">
          <h1 className="font-bold text-2xl xxs:text-xl mt-10">
            Oops, Looks like you've found the
            doorway to the great <span className="text-red-600">nothing</span>
          </h1>
          <p className="text-sm xxs:text-sm mt-5 mb-10">Sorry about that! Please visit our hompage to get where you need to go.</p>
          <div className="flex text-md tracking-widest uppercase justify-center">
            <a
              className="w-full border border-gray-500 rounded-[30px] py-2 xxs:py-2 text-center bg-red-600 hover:bg-red-700 hover:-translate-y-0 hover:scale-105 transition duration-200"
              href="/home"
            >
              Go back
            </a>
          </div>          
        </div>
      </div>
    </motion.div>
  );
}