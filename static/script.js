
/*document.body.onload = (event) => 
{
    getShortcut();
};*/

function sendFormPostRequest() {
    const form = document.getElementById("form");

    const formData = new FormData(form); //Grabs data
    var object = {};

    // Iterates through formData ==> adds to dictionary
    formData.forEach((value, key) => (object[key] = value));

    var json = JSON.stringify(object);
    console.log(json);

    //Fetches cleaned url
    fetch("./api/clean",
        {
            method: "POST",
            headers:
            {
                "Content-Type": "application/json",
            },
            body: json,
        }).then((response) => {
            // Handle the response from the server
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json(); // Assuming the response is in JSON format
        }).then((data) => {
            // set the output div's contents to "output": and an anchor to the new link
            document.getElementById("output").innerHTML = `<a id="clean-url" href ='${data}'> ${data} </a>`
            console.log(data);
        }).catch((error) => {
            // Handle any errors
            console.error("There has been a problem with your fetch operation:", error);
        });


    document.getElementById("copy").disabled = false;

}
