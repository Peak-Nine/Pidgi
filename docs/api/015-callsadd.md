# calls.add

> Source: https://developer.focus.teamleader.eu/docs/api/calls-add

  * [](/)
  * [API Reference](/docs/api)
  * Calendar
  * [Calls](/docs/api/calls)
  * calls.add



# calls.add
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/calls.add

Add a new call.

## Request​

  * application/json



### Body**required**

**description** string

**Example:**`Description of the call`

**participant** objectrequired

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**due_at** stringrequired

**Example:**`2016-02-04T16:00:00+00:00`

**assignee** objectrequired

**type** stringrequired

**Possible values:** [`user`]

**Example:**`user`

**id** stringrequired

**Example:**`66abace2-62af-0836-a927-fe3f44b9b47b`

**deal_id** string

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**custom_fields** object[]

  * Array [

**id** string

**Example:**`bf6765de-56eb-40ec-ad14-9096c5dc5fe1`

**value** object

oneOf

    * string
    * number
    * multiple selection
    * boolean
    * object

****string

For strings

**Example:**`092980616`

****number

For integer, number, money and auto-increment fields

**Example:**`123`

  * Array [

****string

  * ]

****boolean

For Yes/No fields

**Example:**`true`

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `product`, `user`]

**Example:**`company`

  * ]




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "call",  
        "id": "65a35860-dcca-4850-9fd6-47ff08469e0c"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "call",  
        "id": "65a35860-dcca-4850-9fd6-47ff08469e0c"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/calls.add");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"description\": \"Description of the call\",\n  \"participant\": {\n    \"customer\": {\n      \"type\": \"company\",\n      \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n    }\n  },\n  \"due_at\": \"2016-02-04T16:00:00+00:00\",\n  \"assignee\": {\n    \"type\": \"user\",\n    \"id\": \"98b2863e-7b01-4232-82f5-ede1f0b9db22\"\n  },\n  \"deal_id\": \"f29abf48-337d-44b4-aad4-585f5277a456\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
      "description": "Description of the call",
      "participant": {
        "customer": {
          "type": "company",
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
        }
      },
      "due_at": "2016-02-04T16:00:00+00:00",
      "assignee": {
        "type": "user",
        "id": "98b2863e-7b01-4232-82f5-ede1f0b9db22"
      },
      "deal_id": "f29abf48-337d-44b4-aad4-585f5277a456",
      "custom_fields": [
        {
          "id": "bf6765de-56eb-40ec-ad14-9096c5dc5fe1",
          "value": "092980616"
        }
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
