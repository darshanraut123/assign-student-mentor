var express = require('express');
const res = require('express/lib/response');
var mentorRouter = express.Router();
const mongouri = require("../env");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

//Base get route to list all mentors data
mentorRouter.get('/',async (req,res)=>{

  let client =null;
  try {
      client = await MongoClient.connect(mongouri);
      const db = await client.db('student-mentor');
      let document = await db.collection('mentor').find().toArray();

      res.json({
        message:"Data fetched Successfully!",
        data:document
      })

    } catch (error) { 
      console.log(error);
      res.json({
        message:"Internal Server Error!"
      })
    }
    finally{
      client.close();
    }

}); 

//Post route to ladd an new mentor
mentorRouter.post('/addMentor',async (req,res)=>{

    let client =null;
    try {
      client = await MongoClient.connect(mongouri);
      const db = await client.db('student-mentor');
      let data = await db.collection("mentor").find().toArray();
      if(data.filter(res=>res._id===req.body._id).length>=1)
        res.json({message:"duplicate entry"});
        else{
      let doc = await db.collection('mentor').insertOne(req.body);

      res.json({
        message:"Data Added Successfully!",
        data:doc
      })
        }

    } catch (error) { 
      console.log(error);
      res.json({
        message:"Internal Server Error!"
      })
    }
    finally{
      client.close();
    }

}); 

//Route to show all students under specific mentor
mentorRouter.get("/students/:id",async (req,res)=>{
    let client = null;
    try{
      client = await MongoClient.connect(mongouri);
      const db = await client.db("student-mentor");
        let document = await db.collection('mentor').aggregate([
            {$match:{_id:`${req.params.id}`}}
            ,{ $lookup:
               {
                 from: 'student',
                 localField: 'students',
                 foreignField: '_id',
                 as: 'students'
               }
             }
            ]).toArray();

        res.json({"Students under mentor": document[0].students});
    }
    catch(error){
        console.log(error);
        res.json({"message":"Server error"})
    }
    finally{client.close()}
})

//Exporting mentors router
module.exports = mentorRouter;


