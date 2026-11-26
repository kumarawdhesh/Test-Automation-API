import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { closeLoading, showLoading } from "../../store/appSlice";
import { storeDataInStorage } from "../../utils/utility";
import { FALCON_API, REDIRECT_URL } from "../../../environment";
import axios from "axios";

export const Auth = () => {

  const location = useLocation();
  let navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.search !== "") {
      const cognitoInfo = location.search.replace("?", "");
      const cognitoCode = cognitoInfo.split("=")[1];

      dispatch(showLoading());

      axios
        .post(`${FALCON_API}/token-exchange`, {
          function_name: "token-exchange",
          code: cognitoCode,
          redirect_uri: `${REDIRECT_URL}authcallback`,
        })
        .then((response) => {
          storeDataInStorage("username", response?.data?.user_id);
          storeDataInStorage("token", response?.data?.id_token);
          storeDataInStorage("exp", response?.data?.expire);

          dispatch(closeLoading());
          navigate("/accesscheck?app=falcon");
        })
        .catch((error) => {
          console.error("Error fetching token:", error);
          dispatch(closeLoading());
        });
    } else {
      navigate("/login");
    }
  }, [location.search, dispatch, navigate]);

  return <div></div>;
};