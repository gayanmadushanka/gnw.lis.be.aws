var PizZip = require("pizzip");
var Docxtemplater = require("docxtemplater");

// var fs = require("fs");
// var path = require("path");

const AWS = require("aws-sdk");

var s3 = new AWS.S3();

exports.lambdaHandler = async (event, context) => {
  var bucketName = "gnw-lis-source";
  // var filename = "abc.csv";
  var filename = "tag-example.docx";

  try {
    var params = { Bucket: bucketName, Key: filename };

    const data = await s3.getObject(params).promise();

    //Load the docx file as a binary
    //   var content = fs.readFileSync(
    //     path.resolve(__dirname, "tag-example.docx"),
    //     "binary"
    //   );

    var zip = new PizZip(data.Body);
    var doc;
    try {
      doc = new Docxtemplater(zip);
    } catch (error) {
      // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
      errorHandler(error);
    }

    //set the templateVariables
    doc.setData({
      first_name: "John",
      last_name: "Doe",
      phone: "0652455478",
      description: "New Website",
    });

    try {
      // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
      doc.render();
    } catch (error) {
      // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
      errorHandler(error);
    }

    var buf = doc.getZip().generate({ type: "nodebuffer" });

    await s3
      .putObject({
        Bucket: bucketName,
        Key: "new.docx",
        Body: buf,
        ContentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
      .promise();

    // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
    // fs.writeFileSync(path.resolve(__dirname, "output.docx"), buf);

    // fs.writeFileSync(path.resolve(__dirname, "output.docx"), buf);

    // var payload = Buffer.from(buf, "base64").toString("ascii");
    response = {
      statusCode: 200,
      body: "Hello",
    };
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};

// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
function replaceErrors(key, value) {
  if (value instanceof Error) {
    return Object.getOwnPropertyNames(value).reduce(function (error, key) {
      error[key] = value[key];
      return error;
    }, {});
  }
  return value;
}

function errorHandler(error) {
  console.log(JSON.stringify({ error: error }, replaceErrors));

  if (error.properties && error.properties.errors instanceof Array) {
    const errorMessages = error.properties.errors
      .map(function (error) {
        return error.properties.explanation;
      })
      .join("\n");
    console.log("errorMessages", errorMessages);
    // errorMessages is a humanly readable message looking like this :
    // 'The tag beginning with "foobar" is unopened'
  }
  throw error;
}
