import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useAlert(): [string, Dispatch<SetStateAction<string>>] {
  const [alert, setAlert] = useState<string>("");

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      setAlert("");
    }, 3000);

    return () => clearTimeout(timeOutId);
  }, [alert]);

  return [alert, setAlert];
}
