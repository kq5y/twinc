import { useState } from "react";
import createIcs from "twinc-core-ics-creator";
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

  const processFileContent = async (fileContent: string) => {
    if (fileContent) {
      const ICSFile = await createIcs(fileContent, !noDeadlines);
      if (ICSFile) downloadCSV(ICSFile, DEBUG_MODE);
    }
  };

  const handleNoDeadlinesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoDeadlines(e.target.checked);
  };
  const handleCombineSameCourseChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCombineSameCourse(e.target.checked);
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
    });
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
      const fileContent = await readFile(file);
      await processFileContent(fileContent);
    } catch (err) {
      console.error("Failed to read file", err);
    }
  };

  return (
    <div className={coreStyle}>
      <h1>TwinC</h1>
      <p>TWINSまたはKdBもどきのCSVファイルを選択してください</p>
      <h4>詳しい使い方は下にスクロールして、Helpを参照してください</h4>
      <FileSelector onFileChange={onFileSelected} />
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
      <SmallHelp />
      <Help />
      <Footer />
    </div>
  );
}

export default App;
