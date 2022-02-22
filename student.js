const { response } = require("express");
var express = require("express");
var studentRouter = express.Router();
const mongouri = require("../env");
const mongodb = require("mongodb");
const app = require("../app");
const MongoClient = mongodb.MongoClient;

//get route to show all student data
studentRouter.get("/", async (req, res) => {
  let client = null;
  try {
    client = await MongoClient.connect(mongouri);
    const db = await client.db("student-mentor");
    let document = await db.collection("student").find().toArray();

    res.json({
      message: "Data fetched Successfully!",
      data: document,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal Server Error!",
    });
  } finally {
    client.close();
  }
});

//Post request to create new student
studentRouter.post("/addStudent", async (req, res) => {
  let client =null;
  try {
    client = await MongoClient.connect(mongouri);
    const db = await client.db("student-mentor");
    let data = await db.collection("student").find().toArray();
    if(data.filter(res=>res._id===req.body._id).length>=1)
    res.json({message:"duplicate entry"});
    else{
      let doc = await db.collection("student").insertOne(req.body);
      res.json({
      message: "Data Added Successfully!",
      data: doc,
    });
  }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal Server Error!",
    });
  } finally {
    client.close();
  }
});

//Put request to change the mentor of the student, if student is not yet assigned to any mentor still it works
studentRouter.put("/changementor", async (req, res) => {
  let client =null;
  try {
    client = await MongoClient.connect(mongouri);
    const db = await client.db("student-mentor");
    let oldone = await db
      .collection("mentor")
      .findOne({ students: req.body.studentid });
    //checks if mentor is already assigned or not. If its already assigned then its mentor is removed
    if (oldone != null) {
      await db
        .collection("mentor")
        .updateOne(
          { _id: oldone._id },
          { $pull: { students: req.body.studentid } }
        );
    }
    let isStd = await db.collection("student").distinct("_id");

    //new mentor is assigned here if student is present in student collection ,
    // elsewise create student first meassage shown
    if (isStd.includes(req.body.studentid)) {
      let isdone = await db
        .collection("mentor")
        .updateOne(
          { _id: req.body.changetomentor },
          { $push: { students: req.body.studentid } }
        );
      res.json({ res: isdone });
    }
    else
      res.json({
      res: "The student with mentioned id is not present in student collection, please create a new student first",
    });
  } catch (err) {
    console.log(err);
    res.json({ res: err });
  } finally {
    client.close();
  }
});

//All students to which the mentor is not yet assigned
studentRouter.get("/nomentorstudents", async (req, res) => {
  let client =null;
  try {
    client = await MongoClient.connect(mongouri);
    const db = await client.db("student-mentor");
    let assignedStudents = await db.collection("mentor").distinct("students");
    let allStudents = await db.collection("student").distinct("_id");
    //Extracting non assigned mentor students
    let nonAssigned = allStudents.filter(stud=>!assignedStudents.includes(stud));
    let students = await db.collection("student").find().toArray();
    let non = students.filter(res=>nonAssigned.includes(res._id));
    console.log()
    //Sending the response
    res.json({
      message: "Data fetched Successfully!",
      "students without mentor": non
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "Internal Server Error!",
    });
  } finally {
    client.close();
  }
});


studentRouter.get("/abc",(req,res)=>{
  console.log(mongouri);
  res.send()
})

module.exports = studentRouter;
