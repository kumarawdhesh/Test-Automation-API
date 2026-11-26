import { useEffect, useState } from "react";
import { IRIS_API } from "../utils/constants";

const useDummyData = (resId) => {
  const [resInfo, setResInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await fetch(IRIS_API + resId);
    const json = await data.json();
    setResInfo(json.data);
  };

  return resInfo;
};

export default useDummyData;
