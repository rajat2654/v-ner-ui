import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import "./Questions.css";
import React, { Component } from "react";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import axios from "axios";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

const baseURL = "https://vnerapi.azurewebsites.net/api";

class Questions extends Component {
  constructor() {
    super();
    this.state = {
      question: "",
      sNo: 0,
      opt: "",
      options: [],
      subject: "",
      examName: "",
      examId: 0,
      duration: 0,
      nQs: 0,
      editName: false,
      editDuration: false,
    };
  }

  answerOptions = [];
  subjects = ["a", "b"];

  componentDidMount() {
    axios.get(`${baseURL}/getSubjectTags/`).then((response) => {
      this.subjects = response.data["tags"];
    });

    const formData = new FormData();
    formData.append("data", JSON.stringify({ exam_id: 1 }));
    axios
      .post(`${baseURL}/getExamDetails/`, formData)
      .then((response) => {
        console.log(response);
        if (!response.data["task_completed"])
          console.log(response.data["error"]);
        else {
          this.setState(
            {
              examName: response.data["data"]["name"],
              examId: response.data["data"]["_id"],
              duration: response.data["data"]["duration"],
              nQs: response.data["data"]["questions"],
            },
            () => console.log(this.state)
          );
        }
      })
      .catch((err) => console.log(err));
  }

  clearInputFields = () => {
    this.setState({
      question: "",
      opt: "",
      options: [],
      subject: "",
    });
  };

  change = (value, paramName) => {
    console.log(typeof value);
    this.setState({
      [paramName]: value,
    });
  };

  addOption = () => {
    if(!this.state.options.includes(this.state.opt))
    this.setState(
      {
        options: [...this.state.options, this.state.opt],
      },
      // () =>
      //   this.answerOptions.push({ statement: this.state.opt, isAnswer: false })
      this.updateAddItems
    );
  };

  updateAddItems = () => {
    
    this.answerOptions.push({ statement: this.state.opt, isAnswer: false });
    this.setState({
      opt: "",
    });
  };

  handleDelete = (value) => {
    this.setState({
      options: [...this.state.options.filter((option) => option !== value)],
    });
    this.answerOptions = this.answerOptions.filter(
      (option) => option["statement"] !== value
    )
    console.log(this.answerOptions);
  };

  updateAnswers = (e) => {
    this.answerOptions.forEach((option) => {
      if (option["statement"] === e.target.name)
        option["isAnswer"] = e.target.checked;
    });
    console.log(this.answerOptions);
  };

  addQuestion = () => {
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        exam_id: 1,
        question: this.state.question,
        option_type: this.answerOptions.filter(
          (option) => option["isAnswer"] === true
        ).length,
        options: this.answerOptions,
        sub_tags: [this.state.subject],
        marks: {
          positive: 2,
          negative: -1,
        },
      })
    );
    axios
      .post(`${baseURL}/addQuestion/`, formData)
      .then((res) => this.clearInputFields());
  };

  completeExam = () => {
    //close create exam page
  };

  updateExamName = () => {
    this.setState({ editName: false });
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        exam_id: this.state.examId,
        exam_name: this.state.examName,
      })
    );
    axios
      .post(`${baseURL}/change_examName/`, formData)
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  };

  updateExamDuration = () => {
    this.setState({ editDuration: false });
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        exam_id: this.state.examId,
        exam_duration: this.state.duration,
      })
    );
    axios
      .post(`${baseURL}/change_examDuration/`, formData)
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Exam Details</h1>
          <Stack spacing={3} sx={{ width: 900, padding: 5 }}>
            <div className="parent">
              <label className="child1">Exam Name: </label>
              <label className="child2">{this.state.examName}</label>
              <Button
                style={{ width: "50px" }}
                variant="contained"
                color="primary"
                onClick={() => this.change(true, "editName")}
              >
                Edit
              </Button>

              <Dialog open={this.state.editName}>
                <DialogTitle>Edit exam name</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    fullWidth
                    variant="standard"
                    value={this.state.examName}
                    onChange={(e) => this.change(e.target.value, "examName")}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => this.setState({ editName: false })}>
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      this.state.examName
                        ? !this.state.examName.length > 0
                        : true
                    }
                    onClick={this.updateExamName}
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
            <div className="parent">
              <label className="child1">No of Questions: </label>
              <label className="child2">{this.state.nQs}</label>
            </div>
            <div className="parent">
              <label className="child1">Duration: </label>
              <label className="child2">{this.state.duration}</label>
              <Button
                style={{ width: "50px" }}
                variant="contained"
                color="primary"
                onClick={() => this.change(true, "editDuration")}
              >
                Edit
              </Button>

              <Dialog open={this.state.editDuration}>
                <DialogTitle>Edit exam duration</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Duration"
                    type="number"
                    fullWidth
                    variant="standard"
                    value={this.state.duration}
                    onChange={(e) =>
                      this.change(parseInt(e.target.value), "duration")
                    }
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => this.setState({ editDuration: false })}
                  >
                    Cancel
                  </Button>
                  <Button onClick={this.updateExamDuration}>Submit</Button>
                </DialogActions>
              </Dialog>
            </div>
          </Stack>

          <Stack
            spacing={3}
            sx={{
              width: 900,
              backgroundColor: "rgb(137, 199, 205)",
              padding: 5,
            }}
          >
            <h3>Add Question</h3>
            <div className="parent">
              <label className="child1">S No: </label>
              <label className="child2">{this.state.sNo}</label>
            </div>
            <div className="parent">
              <label className="child1">Question: </label>
              <div className="child2">
                <TextField
                  className="tb"
                  style={{ width: "600px" }}
                  id="outlined-textarea"
                  placeholder="Enter your question..."
                  value={this.state.question}
                  onChange={(e) => this.change(e.target.value, "question")}
                  multiline
                />
              </div>
            </div>

            <div className="parent">
              <label className="child1">Options: </label>
              <div className="child2">
                <TextField
                  className="tb"
                  id="outlined-textarea"
                  placeholder="Enter your option..."
                  value={this.state.opt}
                  onChange={(e) => this.change(e.target.value, "opt")}
                />
                <br></br>
                <Stack direction="row" spacing={2}>
                  <Button
                    style={{ marginTop: "10px" }}
                    variant="contained"
                    color="secondary"
                    onClick={this.addOption}
                    disabled={!this.state.opt.length}
                  >
                    Add
                  </Button>
                </Stack>
              </div>
            </div>

            <div className="parent">
              <label className="child1">Answer(s): </label>
              <div className="child2">
                {this.answerOptions.map((option) => {
                  return (
                    <div className="cb">
                      <FormControlLabel
                        control={<Checkbox />}
                        label={option["statement"]}
                        name={option["statement"]}
                        // checked={option["isAnswer"]}
                        onChange={this.updateAnswers}
                      />
                      <HighlightOffIcon
                        sx={{ cursor: "pointer" }}
                        color="warning"
                        onClick={() => this.handleDelete(option["statement"])}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="parent">
              <label className="child1">Subject: </label>
              <div className="child2">
                <Autocomplete
                  className="tb"
                  id="tags-outlined"
                  options={this.subjects}
                  getOptionLabel={(option) => option}
                  filterSelectedOptions
                  onChange={(e, v) => {
                    if (v) this.change(v, "subject");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Subject" />
                  )}
                />
              </div>
            </div>

            {/* <div className="parent">
            <div className="child1"> */}
            <Stack direction="row" spacing={2}>
              <Button
                style={{ width: "200px" }}
                variant="contained"
                color="primary"
                onClick={this.addQuestion}
              >
                Add Question
              </Button>
              {/* </div>
            <div className="child2"> */}
              <Button
                style={{ width: "200px" }}
                variant="contained"
                color="success"
                onClick={this.completeExam}
              >
                Finish exam
              </Button>
            </Stack>
            {/* </div>
            </div> */}
          </Stack>
        </header>
      </div>
    );
  }
}

export default Questions;