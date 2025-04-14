import { fileSelectorStyle } from "./styles";

interface FileSelectorProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  acceptExt?: string;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  onFileChange,
  title = "ファイル選択",
  acceptExt = ".csv",
}) => (
  <div className={fileSelectorStyle}>
    <label>
      {title}
      <input type="file" accept={acceptExt} onChange={onFileChange} />
    </label>
  </div>
);

export default FileSelector;
