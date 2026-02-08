import express from 'express';

const app = express();

 app.get('/',(req,res)=>{
    res.send("Aashrey For Paws");
 });
 app.get("/contact",(req,res)=>{
    const info = {
        phone: "123-456-7890",
        email: "contact@aashreyforpaws.com"
    };
    res.json(info  );
 });
app.listen(5000,()=>{
    console.log("Server is running on port 5000");
});