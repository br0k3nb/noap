export type LanguageNameWithIcon = {
    icon: string;
    name: string;
};
  
export const CODE_LANGUAGE_MAP : Record<string, string> = {
  cpp: 'cpp',
  java: 'java',
  javascript: 'js',
  md: 'markdown',
  plaintext: 'plain',
  python: 'py',
  text: 'plain',
  ts: 'typescript'
};

const CODE_LANGUAGE_FRIENDLY_NAME_MAP : Record<string, LanguageNameWithIcon> = {
    c: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
      name: 'C'
    },
    clike: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg",
      name:'C-like'
    },
    cpp: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
      name: 'C++'
    },
    css: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
      name: 'CSS'
    },
    html: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
      name: 'HTML'
    },
    java: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
      name: 'Java'
    },
    js: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
      name: 'JavaScript'
    },
    markdown: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/markdown/markdown-original.svg",
      name: 'Markdown'
    },
    objc: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/objectivec/objectivec-plain.svg",
      name: 'Objective-C'
    },
    plain: {
      icon: "/src/assets/icons/plain_text.png",
      name: 'Plain Text'
    },
    py: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
      name: 'Python'
    },
    rust: {
      icon: "/src/assets/icons/rust_logo.png",
      name: 'Rust'
    },
    sql: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg",
      name: 'SQL'
    },
    swift: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
      name: 'Swift'
    },
    typescript: {
      icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
      name: 'TypeScript'
    },
    xml: {
      icon: "https://cdn-icons-png.flaticon.com/512/136/136526.png",
      name: 'XML'
    }
};

export default CODE_LANGUAGE_FRIENDLY_NAME_MAP;