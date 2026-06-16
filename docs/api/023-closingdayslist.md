# closingDays.list

> Source: https://developer.focus.teamleader.eu/docs/api/closing-days-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Closing Days](/docs/api/closing-days)
  * closingDays.list



# closingDays.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/closingDays.list

Returns information about closing days of the account

## Request​

  * application/json



### Body

**filter** object

**date_before** string

Start of the period for which to return closing days. This includes closing days starting on the date provided.

**Example:**`2023-12-31`

**date_after** string

End of the period for which to return closing days. This includes closing days ending on the date provided.

**Example:**`2023-12-01`

**page** object

**size** number

**Default value:**`20`

**number** number

**Default value:**`1`




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

**id** string

**Example:**`05676ac4-c61d-42bf-a3ea-a420fc1ec017`

**date** string

**Example:**`2023-12-21`

  * ]

**meta** object

Only included with request parameter `includes=pagination`

**page** object

**size** number

**Example:**`10`

**number** number

**Example:**`2`

**matches** number

**Example:**`12`



    
    
    {  
      "data": [  
        {  
          "id": "05676ac4-c61d-42bf-a3ea-a420fc1ec017",  
          "date": "2023-12-21"  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
      }  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "05676ac4-c61d-42bf-a3ea-a420fc1ec017",  
          "date": "2023-12-21"  
        }  
      ],  
      "meta": {  
        "page": {  
          "size": 10,  
          "number": 2  
        },  
        "matches": 12  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/closingDays.list");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"filter\": {\n    \"date_before\": \"2023-12-31\",\n    \"date_after\": \"2023-12-01\"\n  },\n  \"page\": {\n    \"size\": 20,\n    \"number\": 1\n  }\n}", null, "application/json");  
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
      "filter": {
        "date_before": "2023-12-31",
        "date_after": "2023-12-01"
      },
      "page": {
        "size": 20,
        "number": 1
      }
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
