# files.download

> Source: https://developer.focus.teamleader.eu/docs/api/files-download

  * [](/)
  * [API Reference](/docs/api)
  * Files
  * [Files](/docs/api/files)
  * files.download



# files.download
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/files.download

Request the download link for a file.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb`




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

A temporary url where the requested file can be downloaded

**Example:**`https://cdn.teamleader.eu/file`

**expires_at** string

Expiration time of the temporary download url

**Example:**`2018-02-05T16:44:33+00:00`



    
    
    {  
      "data": {  
        "location": "https://cdn.teamleader.eu/file",  
        "expires_at": "2018-02-05T16:44:33+00:00"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "location": "https://cdn.teamleader.eu/file",  
        "expires_at": "2018-02-05T16:44:33+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/files.download");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb\"\n}", null, "application/json");  
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
      "id": "4afb0a9c-91c6-49ed-a2e5-ce7c1e3a87fb"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
