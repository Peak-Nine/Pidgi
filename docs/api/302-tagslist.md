# tags.list

> Source: https://developer.focus.teamleader.eu/docs/api/tags-list

  * [](/)
  * [API Reference](/docs/api)
  * CRM
  * [Tags](/docs/api/tags)
  * tags.list



# tags.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/tags.list

Get a list of tags.

## Request​

  * application/json



### Body

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`

**sort** object[]

  * Array [

**field** stringrequired

**Possible values:** [`tag`]

**Default value:**`tag`

**order** Order (string)

**Possible values:** [`asc`]

**Default value:**`asc`

  * ]




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**tag** string

**Example:**`campaign`

  * ]



    
    
    {  
      "data": [  
        {  
          "tag": "campaign"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "tag": "campaign"  
        }  
      ]  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/tags.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  },\n  \"sort\": [\n    {\n      \"field\": \"tag\",\n      \"order\": \"asc\"\n    }\n  ]\n}", null, "application/json");  
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

Body

  * Example (from schema)
  * Example


    
    
    {
      "page": {
        "size": 20,
        "number": 1
      },
      "sort": [
        {
          "field": "tag",
          "order": "asc"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
