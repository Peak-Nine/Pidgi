# closingDays.add

> Source: https://developer.focus.teamleader.eu/docs/api/closing-days-add

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Closing Days](/docs/api/closing-days)
  * closingDays.add



# closingDays.add
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/closingDays.add

Adds a closing day for the account.

## Request​

  * application/json



### Body**required**

**day** stringrequired

**Example:**`2024-02-01`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**type** string

**Example:**`closingDay`

**id** stringrequired

**Example:**`eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8`



    
    
    {  
      "data": {  
        "type": "closingDay",  
        "id": "eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "closingDay",  
        "id": "eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/closingDays.add");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"day\": \"2024-02-01\"\n}", null, "application/json");  
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
      "day": "2024-02-01"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
