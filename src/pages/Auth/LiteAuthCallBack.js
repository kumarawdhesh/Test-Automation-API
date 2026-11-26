import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { closeLoading, showLoading } from "../../store/appSlice";
import { storeDataInStorage } from "../../utils/utility";
import { FALCON_API, REDIRECT_URL } from "../../../environment";
import axios from "axios";

const LiteAuthCallBack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.search !== "") {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");

      dispatch(showLoading());
      
      axios
        .post(`${FALCON_API}/token-exchange`, {
          function_name: "token-exchange",
          code,
          redirect_uri: `${REDIRECT_URL}falcon-lite/nexus/authcallback`,
        })
        .then((response) => {          
          storeDataInStorage("username", response?.data?.user_id);
          storeDataInStorage("token", response?.data?.id_token);
          storeDataInStorage("exp", response?.data?.expire);

          dispatch(closeLoading());

          setTimeout(() => {
            navigate("/accesscheck?app=falcon-lite");
          }, 500);
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

export default LiteAuthCallBack;