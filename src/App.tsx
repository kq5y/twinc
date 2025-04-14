import { useRef, useState } from "react";
import createIcs from "twinc-core-ics-creator";
import * as xlsx from "xlsx";
import Button from "./components/Button";
import FileSelector from "./components/FileSelector";
import Footer from "./components/Footer";
import Help from "./components/Help";
import { SmallHelp } from "./components/SmallHelp";
import downloadCSV from "./components/downloadCSV";
import { coreStyle } from "./components/styles";

declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean;
  }
}

const DEBUG_MODE = false;

function App() {
  const [noDeadlines, setNoDeadlines] = useState(false);
  const [combineSameCourse, setCombineSameCourse] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const classroomMap = useRef<Record<string, string>>({});

  const handleNoDeadlinesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoDeadlines(e.target.checked);
  };
  const handleCombineSameCourseChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCombineSameCourse(e.target.checked);
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) {
      window.alert("ファイルが選択されていません");
      return;
    }

    if (!file.name.endsWith(".csv")) {
      window.alert("CSVファイルをアップロードしてください");
      return;
    }

    try {
      const newFileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
      });
      setFileContent(newFileContent as string);
    } catch (err) {
      console.error("Failed to read file", err);
    }
  };

  const onLocExcelFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!file) {
      window.alert("ファイルが選択されていません");
      return;
    }

    if (!file.name.endsWith(".xlsx")) {
      window.alert("Excelファイルをアップロードしてください");
      return;
    }

    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      const workbook = xlsx.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet);
      classroomMap.current = jsonData.reduce(
        (acc: Record<string, string>, row: any) => {
          const { 教室: classroom, 科目番号: classcode } = row;
          if (typeof classroom === "string" && typeof classcode === "string") {
            acc[classcode] = classroom;
          }
          return acc;
        },
        {} as Record<string, string>,
      );
    } catch (err) {
      console.error("Failed to read file", err);
    }
  };

  const handleDownloadClick = async () => {
    if (fileContent) {
      const ICSFile = await createIcs(
        fileContent,
        !noDeadlines,
        combineSameCourse,
        classroomMap.current,
      );
      if (ICSFile) downloadCSV(ICSFile, DEBUG_MODE);
    } else {
      window.alert("CSVファイルを選択してください");
    }
  };

  return (
    <div className={coreStyle}>
      <h1>TwinC</h1>
      <p>TWINSまたはKdBもどきのCSVファイルを選択してください</p>
      <h4>詳しい使い方は下にスクロールして、Helpを参照してください</h4>
      <FileSelector title="CSVファイルを選択" onFileChange={onFileSelected} />
      <FileSelector
        title="教室Excelファイルを選択"
        acceptExt=".xlsx"
        onFileChange={onLocExcelFileSelected}
      />
      <div>
        <input
          id="includeDeadlines"
          type="checkbox"
          name="includeDeadlines"
          checked={noDeadlines}
          onChange={handleNoDeadlinesChange}
        />
        <label htmlFor="includeDeadlines">
          事前登録・履修登録締切日を追加しない
        </label>
      </div>
      <div>
        <input
          id="combineSameCourse"
          type="checkbox"
          name="combineSameCourse"
          checked={combineSameCourse}
          onChange={handleCombineSameCourseChange}
        />
        <label htmlFor="combineSameCourse">
          連続する授業を1つのイベントにまとめる
        </label>
      </div>
      <Button
        text="ダウンロード"
        onClick={handleDownloadClick}
        disabled={!fileContent}
      />
      <SmallHelp />
      <Help />
      <Footer />
    </div>
  );
}

export default App;
