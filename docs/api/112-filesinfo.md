# files.info

> Source: https://developer.focus.teamleader.eu/docs/api/files-info

  * [](/)
  * [API Reference](/docs/api)
  * Files
  * [Files](/docs/api/files)
  * files.info



# files.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/files.info

Get details for a single file.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`6fac0bf0-e803-424e-af67-76863a3d7d16`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`a856642a-a476-4b69-8e42-e7d1badb2ce9`

**subject** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `deal`, `invoice`, `creditNote`, `meeting`, `order`, `product`, `project`, `nextgenProject`, `ticket`, `workOrder`]

**Example:**`company`

**name** string

**Example:**`meeting-report.pdf`

**mime_type** MimeType (string)

**Possible values:** [`application/msword`, `application/octet-stream`, `application/pdf`, `application/vnd.ms-excel`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/xml`, `application/zip`, `audio/mpeg`, `audio/wav`, `image/gif`, `image/jpeg`, `image/png`, `text/css`, `text/csv`, `text/html`, `text/javascript`, `text/plain`, `video/3gpp`, `video/mpeg`, `video/quicktime`, `video/x-msvideo`]

**size** number

file size in bytes.

**Example:**`1024`

**updated_at** string

**Example:**`2019-10-15T17:30:58+00:00`

**uploaded_by** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**folder** string

**Example:**`Documents`



    
    
    {  
      "data": {  
        "id": "a856642a-a476-4b69-8e42-e7d1badb2ce9",  
        "subject": {  
          "type": "company",  
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
        },  
        "name": "meeting-report.pdf",  
        "mime_type": "application/msword",  
        "size": 1024,  
        "updated_at": "2019-10-15T17:30:58+00:00",  
        "uploaded_by": {  
          "type": "user",  
          "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
        },  
        "folder": "Documents"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "a856642a-a476-4b69-8e42-e7d1badb2ce9",  
        "subject": {  
          "type": "company",  
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"  
        },  
        "name": "meeting-report.pdf",  
        "mime_type": "application/msword",  
        "size": 1024,  
        "updated_at": "2019-10-15T17:30:58+00:00",  
        "uploaded_by": {  
          "type": "user",  
          "id": "bef8c53b-b6bc-0fde-944e-5c4b16e5155a"  
        },  
        "folder": "Documents"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/files.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"6fac0bf0-e803-424e-af67-76863a3d7d16\"\n}", null, "application/json");  
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
      "id": "6fac0bf0-e803-424e-af67-76863a3d7d16"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
