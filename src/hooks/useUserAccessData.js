// useUserAccessData.js
import { useGetUserAccessInfoMutation } from "./../store/mdtSlice";

const useUserAccessData = () => {
  const [getUserAccessInfo] = useGetUserAccessInfoMutation(); // Initialize the mutation hook
  
  const fetchData = async (requestData) => {
    try {
      const response = await getUserAccessInfo({
        user_id: requestData,
        function_name: "mdt-get-user-access-info",
        type: "monitor"
      })
      return response;
    } catch (err) {}
  };
  return { fetchData };
};
export default useUserAccessData;
