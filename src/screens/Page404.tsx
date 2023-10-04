import error404 from '../assets/error404.png';
import { motion } from 'framer-motion';

export default function Page404() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-gray-900 h-screen overflow py-20 xxs:py-0 items-center flex justify-center flex-col md:gap-28 gap-16"
    >
      <div className="max-w-xl px-6">
        <img 
          src={error404} 
          className='w-full pt-10 xxs:pt-0 object-cover' 
          draggable={false}
        />
        <div className="px-4 text-gray-100">
          <h1 className="text-2xl xxs:text-xl mt-10">
            Looks like you've found the
            doorway to the great {" "}
            <span className="text-red-600">
              nothing
            </span>
          </h1>
          <div className="flex text-md tracking-widest uppercase justify-center mt-8">
            <a
              className="w-full border border-gray-500 rounded-[30px] py-2 xxs:py-2 text-center bg-red-700 hover:bg-red-800 hover:-translate-y-0 hover:scale-105 transition duration-200"
              href="/notes/page/1"
            >
              Go back
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}