import React, { useEffect, useState } from "react";
import {
  Grid,
  Button,
  Box,
  TextField,
  InputLabel,
  Divider,
  MuiThemeProvider,
  createMuiTheme,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { useTheme } from "@material-ui/styles";
import SendIcon from "@material-ui/icons/Send";
import { CloudUpload, Description } from "@material-ui/icons";
// styles
import useStyles from "./styles";
import ImageShowCase from "../../images/image-column.PNG";
import AudioShowCase from "../../images/audio.PNG";
import VideoShowCase from "../../images/video-column.PNG";
import PhoneShowCase from "../../images/phone-number.PNG";
// components
import mock from "./mock";
import Widget from "../../components/Widget/Widget";
import PageTitle from "../../components/PageTitle/PageTitle";
import { Typography } from "../../components/Wrappers/Wrappers";
import Table from "./components/Table/Table";
import Modal from "../../components/Modal/Modal";
import { useDispatch, useStore, useSelector } from "react-redux";
import {
  setTemplateMessages,
  fetchTemplateMessages,
  sendTemplateMessage,
  sendBulkUploadTemplateMessage,
  fetchVariablesFromTemplates,
  sendVariableTemplates,
  userHistoryData,
} from "../../store/reducer/broadcast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useRouteMatch } from "react-router-dom";
import { timeConverter } from "../../utils/date-parse";
import axios from "axios";

const FirstStep = ({
  data,
  onChangeBroadcastName,
  onChangeTemplate,
  selectedTemplate,
  broadcastName,
}) => {
  return (
    <div>
      <TextField
        autoFocus
        margin="dense"
        id="broadcast-name"
        label="Broadcast Name"
        value={broadcastName}
        type="text"
        variant={"outlined"}
        onChange={onChangeBroadcastName}
        size={"medium"}
        fullWidth
      />
      <br />
      <br />
      <Autocomplete
        id="combo-box-demo"
        freeSolo
        size={"small"}
        options={data}
        onChange={onChangeTemplate}
        getOptionLabel={(option) =>
          option.name.toString().replaceAll("_", " ") +
          "_".toString().concat(option.language.toString())
        }
        fullWidth
        renderInput={(params) => (
          <TextField {...params} label="Select Template" variant="outlined" />
        )}
      />
    </div>
  );
};
const AddSequenceStep = ({ onChangeSequence, sequenceName, classes }) => {
  return (
    <div>
      <p className={"mb-[10px] mt-[10px]"}>Sequence Name</p>
      <TextField
        fullWidth
        value={sequenceName}
        onChange={onChangeSequence}
        label={"Sequence Name"}
        variant={"filled"}
      />
      <br />
      <br />
    </div>
  );
};

const ThirdStep = (props) => {
  const { classes, onFileLoad, file, onUploadCSV, variables } = props;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography className={classes.text} variant={"subtitle1"} gutterBottom>
          You have to upload CSV file with extension(.csv).
        </Typography>
        <Box display={"flex"} alignItems={"center"}>
          <Description color={"primary"} />
          <Typography weight="bold" color="primary" className={classes.text}>
            {file?.name ? file?.name : "No Files"}
          </Typography>
        </Box>
        <br />
      </Grid>
      <Grid item xs={6}>
        <div>
          <input
            accept=".xslx,.csv,.xls,.png"
            className={classes.inputFile}
            id="contained-button-file"
            onChange={onFileLoad}
            disabled={file !== undefined}
            type="file"
          />
          <label htmlFor="contained-button-file">
            <Button
              variant="contained"
              startIcon={<Description />}
              disabled={file !== undefined}
              className={classes.buttonPrimary}
              color={"primary"}
              component="span"
            >
              Choose Files
            </Button>
          </label>
        </div>
      </Grid>
      <br />
      <br />
      <br />
      <Typography variant={"subtitle2"} color={"secondary"} gutterBottom>
        Please read guidelines carefully below before uploading CSV(.csv) file.
      </Typography>

      <Grid item xs={12}>
        <ShowCaseTemplate classes={classes} variables={variables} />
      </Grid>
    </Grid>
  );
};

const ShowCaseTemplate = (props) => {
  const { classes, variables } = props;

  const showCaseTextItems = variables?.map((item) => {
    if (item?.format.toLowerCase() == "text") {
      let no_of_variable = item?.no_of_variable;
      return (
        <>
          <Typography variant={"subtitle2"}>
            You have <b>{no_of_variable}</b> text variable in below
            template.Make columns according to variable names like if variable
            name is <b>{"{{1}}"}</b> then make a column with name <b>1</b> and
            then put the values in it. Variable name you can see in curly
            braces.
          </Typography>
          <br />
          <Typography className={classes.templateText} variant={"h5"}>
            {item?.text}
          </Typography>
        </>
      );
    } else {
      return (
        <>
          <Typography variant={"subtitle2"}>
            You have a <b>{item?.format.toLowerCase()}</b> variable in this
            template. Make a column in csv shown in below picture and put{" "}
            <b>{item?.format.toLowerCase()}</b> urls in it.
          </Typography>

          {item?.format.toLowerCase() == "video" && (
            <img className={classes.showCaseImage} src={VideoShowCase} />
          )}
          {item?.format.toLowerCase() == "image" && <img src={ImageShowCase} />}
          {item?.format.toLowerCase() == "audio" && <img src={AudioShowCase} />}
        </>
      );
    }
  });
  return (
    <>
      <Typography variant={"subtitle2"}>
        Make a column named <b>to</b> shown in below picture and put the
        recipients phone number in it with country code.
      </Typography>
      <img className={classes.showCaseImage} src={PhoneShowCase} />
      {showCaseTextItems}
    </>
  );
};

const FillingTemplates = (props) => {
  const {
    classes,
    variables,
    onVariableChange,
    templateData,
    templateName,
  } = props;

  const variablesItem = variables?.map((item) => {
    if (item?.format == "text") {
      let no_of_variable = item?.no_of_variable;
      let variableIndexes = [];
      let templateString;
      let initialIndex = 0;
      for (let i = 1; i <= no_of_variable; i++) {
        let placeholder = `{{${i}}}`;
        let textString = item?.text.toString();
        let index = textString.indexOf(placeholder);
        let slicedString = textString.slice(initialIndex, index);
        templateString = (
          <>
            <Typography size={"xs"} variant={"body1"} component={"span"}>
              {slicedString}
            </Typography>
            <input
              type={"text"}
              name={i.toString()}
              className={classes.variableInput}
              onChange={(e) => onVariableChange(e, item)}
            />
          </>
        );
        variableIndexes.push(templateString);
        initialIndex = parseInt(index) + parseInt(placeholder.length);
      }
      let joinedText = variableIndexes.map((item) => item);

      return <>{joinedText}</>;
    }
  });
  const ifVariableLengthZero = templateData?.waba_templates.map((item) => {
    let tempString = "";
    console.log(templateName);
    console.log(item?.name);
    if (item?.name == templateName) {
      if (item?.components?.length > 0) {
        let comp = item.components.map((it) => {
          if (it?.text != undefined && it.text != null) {
            tempString += it?.text;
          }
        });
      }
      return (
        <Typography size={"xs"} variant={"body1"} component={"span"}>
          {tempString}
        </Typography>
      );
    }
  });
  return (
    <Grid container>
      <Grid item xs={12}>
        <br />
        {variables.map((item) => {
          if (item?.format == "text") {
            return (
              <>
                <br />
                <Typography size={"sm"} variant={"h6"} weight={"bold"}>
                  {item?.type}
                </Typography>
                <br />
                {variablesItem}
                <br />
              </>
            );
          } else {
            return (
              <>
                <br />
                <Typography size={"sm"} variant={"h6"} weight={"bold"}>
                  {item?.type}
                </Typography>
                <br />
                <TextField
                  variant={"outlined"}
                  fullWidth
                  onChange={(e) => onVariableChange(e, item)}
                  placeholder={`Enter url of ${item?.format.toLowerCase()}`}
                />
                <br />
              </>
            );
          }
        })}
        {variables.length == 0 && (
          <>
            <Typography weight={"bold"} size={"md"}>
              Template name : {templateName}
            </Typography>
            {ifVariableLengthZero}
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default function Sequence() {
  var classes = useStyles();
  var theme = useTheme();
  const dispatch = useDispatch();
  const store = useStore();
  const templateData = useSelector((state) => state.broadcast.templateMessages);

  const error = useSelector((state) => state.broadcast.error);
  const responseVariableMessageId = useSelector(
    (state) => state.broadcast.variableMessageId,
  );
  const responseSendingBulkTemplateMsg = useSelector(
    (state) => state.broadcast.responseSendingBulkTemplateMsg,
  );
  const variables = useSelector((state) => state.broadcast.variables);

  //loader for sending request
  const loading = useSelector((state) => state.broadcast.loading);

  // useEffect for message modal close
  useEffect(() => {
    if (
      responseVariableMessageId != undefined &&
      responseVariableMessageId != ""
    ) {
      setOpenMessageModal(false);
      setContactsFile(undefined);
      setContactNumber("");
      setSelectedTemplate(undefined);
      if (Object.keys(singleSendingLocalObj).length > 0) {
        setTimeout(() => setDataInLocalStorage(singleSendingLocalObj), 5000);
        setSingleSendingLocalObj({});
      }
    }
  }, [responseVariableMessageId]);

  useEffect(() => {
    if (Object.keys(responseSendingBulkTemplateMsg).length > 0) {
      setOpenBroadcastModal(false);
      setContactsFile(undefined);
      setBroadcastName("");
      setSelectedTemplate(undefined);
      if (Object.keys(singleBulkLocalObj).length > 0) {
        setTimeout(() => setDataInLocalStorage(singleBulkLocalObj), 5000);
        setBulkSendingLocalObj({});
      }
    }
  }, [responseSendingBulkTemplateMsg]);

  // useEffect for fetching templates
  useEffect(() => {
    dispatch(fetchTemplateMessages());
  }, []);

  const [variableState, setVariableState] = useState([]);
  const [linkState, setLinkState] = useState([]);

  // broadcast modal state
  const [openBroadcastModal, setOpenBroadcastModal] = useState(false);
  const [
    currentBroadcastModalStepIndex,
    setBroadcastCurrentModalStepIndex,
  ] = useState(0);
  const [broadcastName, setBroadcastName] = useState("");
  const [singleBulkLocalObj, setBulkSendingLocalObj] = useState({});

  // sequence step params
  const [currentSequenceName, setCurrentSequenceName] = useState("");
  const [currentSequenceModalStep, setCurrentSequenceModalStep] = useState(0);
  const [openSequenceModal, setOpenSequenceModal] = useState(0);

  // single message modal state
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [
    currentMessageModalStepIndex,
    setMessageCurrentModalStepIndex,
  ] = useState(0);
  const [contactNumber, setContactNumber] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(undefined);
  const [singleSendingLocalObj, setSingleSendingLocalObj] = useState({});

  const [contactsFile, setContactsFile] = useState(undefined);
  const [selectedDocument, setSelectedDocument] = useState(undefined);

  const onContactsFileLoad = ({ target }) => {
    console.log(target.files[0].name);
    setContactsFile(target.files[0]);
  };
  const onUploadCSV = () => {};

  const onSelectDocument = ({ target }) => {
    console.log(target.files[0].name);
    setSelectedDocument(target.files[0]);
  };

  const tplList = templateData?.waba_templates
    ? templateData?.waba_templates
    : [];
  const onChangeTemplate = (e, newValue) => {
    setSelectedTemplate(newValue);
  };
  const onChangeBroadcastName = (e) => {
    const name = e.target.value;
    setBroadcastName(name);
  };

  const BroadcastModalStepArray = [
    <FirstStep
      onChangeTemplate={onChangeTemplate}
      onChangeBroadcastName={onChangeBroadcastName}
      selectedTemplate={selectedTemplate}
      broadcastName={broadcastName}
      data={tplList}
    />,
    // <SecondStep onFileLoad={onSelectDocument}
    // file={selectedDocument}
    // classes={classes}/>,
    <ThirdStep
      onFileLoad={onContactsFileLoad}
      onUploadCSV={onUploadCSV}
      file={contactsFile}
      variables={variables}
      classes={classes}
    />,
  ];

  const onChangeSequence = (e) => {
    const { value } = e.target;
    setCurrentSequenceName(value);
  };
  const onVariableChange = (e, item) => {
    let name = e.target.name;
    let value = e.target.value;
    let format = item.format;
    let type = item.type;
    let variableObj = {
      name,
      value,
    };
    if (format == "text") {
      let index = variableState.findIndex(
        (item) => item.type.toLowerCase() == type.toLowerCase(),
      );
      let obj = {
        type: type.toLowerCase(),
        variable: [variableObj],
      };

      if (index != -1) {
        let copyOfVariableState = variableState;
        let variableArray = copyOfVariableState[index].variable;
        let variableIndex = variableArray.findIndex(
          (item) => item.name == name,
        );
        if (variableIndex != -1) {
          variableArray[variableIndex].value = value;
          copyOfVariableState[index].variable = variableArray;
          // console.log(copyOfVariableState)
          setVariableState(copyOfVariableState);
        } else {
          let newArray = [...variableArray, variableObj];
          copyOfVariableState[index].variable = newArray;
          setVariableState(copyOfVariableState);
        }
      } else {
        // console.log("in else")
        let newArray = [...variableState, obj];
        setVariableState(newArray);
      }
    } else {
      let index = linkState.findIndex(
        (item) => item.format == format.toLowerCase(),
      );
      let obj = {
        type: type.toLowerCase(),
        format: format.toLowerCase(),
        link: value,
      };
      let copyOfLinkState = linkState;
      if (index != -1) {
        copyOfLinkState[index].link = value;
        setLinkState(copyOfLinkState);
      } else {
        let newArray = [...copyOfLinkState, obj];
        setLinkState(newArray);
      }
    }
  };
  const AddSequenceModalArray = [
    <AddSequenceStep
      sequenceName={currentSequenceName}
      onChangeSequence={onChangeSequence}
      classes={classes}
    />,
  ];

  //broadcast modal function
  const onBroadcastModalNextClick = () => {
    if (currentBroadcastModalStepIndex < BroadcastModalStepArray.length) {
      console.log(broadcastName, selectedTemplate);

      if (
        currentBroadcastModalStepIndex ==
        BroadcastModalStepArray.length - 1
      ) {
        if (contactsFile && selectedTemplate && broadcastName) {
          let obj = new FormData();
          obj.append("file", contactsFile);
          obj.append("template_name", selectedTemplate.name);
          obj.append("namespace", selectedTemplate.namespace);
          obj.append("language", selectedTemplate.language);
          obj.append("brodcast_name", broadcastName);
          dispatch(sendBulkUploadTemplateMessage(obj));

          const localObj = {
            number: "none",
            broadcast_name: broadcastName,
            template_name: selectedTemplate?.name,
            file: contactsFile?.name,
            type: "Broadcast",
            status: "Sent",
          };
          setBulkSendingLocalObj(localObj);
        }
      } else if (broadcastName.length > 4 && selectedTemplate) {
        console.log("click");
        let requestObj = {
          template_name: selectedTemplate.name,
          language: selectedTemplate.language,
        };
        dispatch(fetchVariablesFromTemplates(requestObj));
        setBroadcastCurrentModalStepIndex(currentBroadcastModalStepIndex + 1);
      }
    }
  };
  const onBroadcastModalCancelClick = () => {
    setOpenBroadcastModal(false);
    setContactsFile(undefined);
    setBroadcastName("");
    setSelectedTemplate(undefined);
  };
  const addNewBroadCast = () => {
    setOpenBroadcastModal(true);
    setBroadcastCurrentModalStepIndex(0);
  };
  const userHistory = useSelector((state) => state.broadcast.userHistory);
  let [listData, setListData] = useState([]);

  useEffect(() => {
    dispatch(userHistoryData());
  }, []);
  useEffect(() => {
    try {
      // localStorage.removeItem("id_token")
      // localStorage.removeItem("messages")
      let newData = userHistory.map((item) => {
        return {
          number: item?.number,
          type: item?.type,
          template_name: item?.template_name,
          broadcast_name: item?.brodcast_name,
          file: item?.file,
          timestamp: item?.timestamp,
          status: item?.status,
        };
      });
      newData.sort((a, b) => {
        if (
          new Date(timeConverter(a?.timestamp)) >
          new Date(timeConverter(b?.timestamp))
        ) {
          return -1;
        }
        if (
          new Date(timeConverter(a?.timestamp)) <
          new Date(timeConverter(b?.timestamp))
        ) {
          return 1;
        }
        return 0;
      });
      setListData(newData);
    } catch (e) {
      console.log(e);
    }
  }, [userHistory]);

  //set data in localstorage
  const setDataInLocalStorage = (obj) => {
    try {
      dispatch(userHistoryData());
      // let newData  = [...listData ,  obj]
      // setListData(newData)
    } catch (e) {
      console.log(e);
    }
  };

  //get data from localstorage
  const getDataFromLocalStorage = (obj) => {};

  //single sending modal function
  const onSequenceModalNextClick = async () => {
    const data = JSON.stringify({
      phone: 918890293146,
      sequence_name: "seq1",
    });
    const config = {
      method: "post",
      url: "https://api.notbot.in/send_sequence",
      headers: {
        Authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTY1MDM2MTMyOCwianRpIjoiM2EyOWM1ZDctM2U5Ni00NGU1LTgzNTUtZThhZmFmMDcxMjMyIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6ImZvb0Bmb28uZm9vIiwibmJmIjoxNjUwMzYxMzI4fQ.QIPBc1-ykwUe5KcCEXlHPkeFC280c5Mrmic_UNZ__N4",
        "Content-Type": "application/json",
      },
      data,
    };
    if (
      currentSequenceName.toString().length > 0 &&
      currentSequenceName.split(" ").length === 1
    ) {
      try {
        const res = await axios(config);
      } catch (err) {
        console.log(err);
      }
    }
  };
  const onSequenceModalCancelClick = () => {
    setOpenSequenceModal(false);
    setCurrentSequenceName("");
  };
  const addNewSequence = () => {
    setOpenSequenceModal(true);
    setCurrentSequenceModalStep(0);
  };

  const HeaderBtnComponent = () => (
    <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
      {/*<Button*/}
      {/*  variant="contained"*/}
      {/*  size="medium"*/}
      {/*  color="primary"*/}
      {/*  onClick={addNewBroadCast}*/}
      {/*  startIcon={<SendIcon/>}>New Broadcast</Button>*/}
      <Button
        style={{ marginLeft: "20px" }}
        variant="contained"
        size="medium"
        color="primary"
        onClick={addNewSequence}
        startIcon={<SendIcon />}
      >
        Add Sequence
      </Button>
    </Box>
  );

  return (
    <div className="grid lg:grid-cols-12 w-full bg-appGray-500 h-screen ">
      <div className="col-span-12 overflow-auto">
        <PageTitle title="Sequence" button={<HeaderBtnComponent />} />
        {/*broadcast modal*/}
        {/*<Modal title={"New Broadcast"}*/}
        {/*       onNext={onBroadcastModalNextClick}*/}
        {/*       loading={loading}*/}
        {/*       error={error}*/}
        {/*       theme={theme}*/}
        {/*       onCancel={onBroadcastModalCancelClick}*/}
        {/*       open={openBroadcastModal} >*/}
        {/*  {BroadcastModalStepArray[currentBroadcastModalStepIndex]}*/}
        {/*</Modal>*/}
        {/*single sending modal*/}
        <Modal
          title={"Add New Sequence"}
          onNext={onSequenceModalNextClick}
          onCancel={onSequenceModalCancelClick}
          loading={loading}
          error={error}
          theme={theme}
          open={openSequenceModal}
        >
          {AddSequenceModalArray[currentSequenceModalStep]}
        </Modal>
        <Widget
          title="Sequences List"
          upperTitle
          noBodyPadding
          disableWidgetMenu={true}
          bodyClass={classes.tableWidget}
        >
          <Table data={listData} />
        </Widget>
      </div>
    </div>
  );
}
