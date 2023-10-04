import "./index.css";

type Props = {
  width?: string | number;
  height?: string | number;
};

export default function Loader({ width, height }: Props) {
  return (
    <div className="bouncing-loader">
        <div 
          style={{ 
            width: width ? width : 'inherit',
            height: height ? height : 'inherit',
          }}
        />
        <div
          style={{ 
            width: width ? width : 'inherit',
            height: height ? height : 'inherit',
          }}
        />
        <div
          style={{ 
            width: width ? width : 'inherit',
            height: height ? height : 'inherit',
          }}
        />
    </div>
  );
};