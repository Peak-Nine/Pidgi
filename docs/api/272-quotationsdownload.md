# quotations.download

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-download

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.download



# quotations.download
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.download

Download a quotation in a specific format.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`d885e5d5-bacb-4607-bde9-abc4a04a901b`

**format** stringrequired

**Possible values:** [`pdf`]

**Example:**`pdf`




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

**expires** string

Expiration time of the temporary download link

**Example:**`2018-02-05T16:44:33+00:00`



    
    
    {  
      "data": {  
        "location": "https://cdn.teamleader.eu/file",  
        "expires": "2018-02-05T16:44:33+00:00"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "location": "https://cdn.teamleader.eu/file",  
        "expires": "2018-02-05T16:44:33+00:00"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.download");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"d885e5d5-bacb-4607-bde9-abc4a04a901b\",\n  \"format\": \"pdf\"\n}", null, "application/json");  
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
      "id": "d885e5d5-bacb-4607-bde9-abc4a04a901b",
      "format": "pdf"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
