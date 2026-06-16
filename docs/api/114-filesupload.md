# files.upload

> Source: https://developer.focus.teamleader.eu/docs/api/files-upload

  * [](/)
  * [API Reference](/docs/api)
  * Files
  * [Files](/docs/api/files)
  * files.upload



# files.upload
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/files.upload

Request the upload link for a file.

The following remarks apply to `temporary` files:

  * they exist for a maximum of 24 hours if not linked to an entity
  * do not show up in any file overview
  * are not included in external syncs



## Request​

  * application/json



### Body**required**

**name** stringrequired

Name under which the file will be stored. This name should contain the same extension as the file that the user wants to upload.

**Example:**`Important meeting note from August 2022.docx`

**subject** objectrequired

**id** stringrequired

Not required if `type` is `temporary`

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`company`, `contact`, `deal`, `invoice`, `creditNote`, `nextgenProject`, `ticket`, `temporary`]

**Example:**`company`

**folder** string

Name of a folder under which the file will be stored. Defaults to `General` in account's language if not passed.

**Example:**`My monthly notes`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**location** string

The temporary API endpoint (URL) that should be used for sending a POST request to with the binary file contents (not form-data) to complete the file upload.

**Example:**`https://files.teamleader.eu/upload/66726166a`

**expires_at** string

Expiration time of the temporary API endpoint.

**Example:**`2019-10-30T11:44:33+00:00`



    
    
    {  
      "data": {  
        "location": "https://files.teamleader.eu/upload/66726166a",  
        "expires_at": "2019-10-30T11:44:33+00:00"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "location": "https://files.teamleader.eu/upload/66726166a",  
        "expires_at": "2019-10-30T11:44:33+00:00"  
      }  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/files.upload");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"name\": \"Important meeting note from August 2022.docx\",\n  \"subject\": {\n    \"type\": \"company\",\n    \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n  },\n  \"folder\": \"My monthly notes\"\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required

  * Example (from schema)
  * Example


    
    
    {
      "name": "Important meeting note from August 2022.docx",
      "subject": {
        "type": "company",
        "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
      },
      "folder": "My monthly notes"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
