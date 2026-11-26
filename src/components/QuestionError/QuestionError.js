import React from 'react'
import AvatarLetter from '../AvatarLetter/AvatarLetter';
import { Typography, Box, Avatar, Card, CardContent, Divider, CardActions } from '@mui/material';
import ChatSummaryDisplay from '../ChatSummaryDisplay/ChatSummaryDisplay';
import  * as classes from './QuestionError.module.css';
import QuestionLevelFeedback from '../QuestionLevelFeedback/QuestionLevelFeedback';


const QuestionError = (props) => {
    const {userData,question,question_details,errorOrDefault} = props
    const {question_id,chat_id,data_domain} = question_details


    return (
        <Box p={2} id={`question_card_container_${question_id}`} >
          <Box style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
            {userData.full_name != "" && (
              <div style={{ marginRight: "10px" }}>
                <AvatarLetter fullName={userData?.full_name} />
              </div>
            )}
            <Typography variant="body2" style={{ marginLeft: "20px" }}>
              {question}
            </Typography>
          </Box>
          <Box style={{ display: "flex", marginTop: "10px" }}>
            <Box
              style={{ flex: "0 0 auto", marginTop: "20px" }}
            >
              <Avatar
                style={{ borderRadius: "4px" }}
                alt="Avatar"
                src="./../assets/image/avtar-chatgpt.png"
              />
              </Box>
            <Box  style={{  flexGrow:"1" , marginTop: "20px" }}>
              <div className={classes["card-container-error"]} style={{ width:"100%"}}>
                <Card sx={{boxShadow:"none"}}>
                  <CardContent sx={{paddingTop:"0px"}}>
                    <ChatSummaryDisplay
                      dictionary={question_details}
                      keyToRender={"error"}
                    />
                  </CardContent>
                  <CardActions style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Typography style={{ marginLeft: '10px' }} variant="body2" className={classes['title-text']}>
                        Sources :
                      </Typography>
                      <Typography style={{ marginLeft: '10px' }} variant="body2">
                        {data_domain}
                      </Typography>
                    </div>
                  </CardActions>
                </Card>
              </div>
            </Box>
            <Box  style={{ display: "flex", marginTop: "20px",flexDirection:"column",justifyContent : "space-between", flex: "0 0 auto",width:"80px" }}>
              <div></div>
              <div style={{paddingBottom:"20px"}}> <QuestionLevelFeedback  chat_id={chat_id}  question_id={question_id} /></div>
            </Box>
          </Box>
        </Box>
      );
}

export default QuestionError
