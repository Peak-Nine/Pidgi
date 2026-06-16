# customFieldDefinitions.info

> Source: https://developer.focus.teamleader.eu/docs/api/custom-field-definitions-info

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Custom Fields](/docs/api/custom-fields)
  * customFieldDefinitions.info



# customFieldDefinitions.info
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/customFieldDefinitions.info

Get info about a specific custom field definition.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`9c64570b-4ec1-4e03-9662-af904f78f7fa`




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

**Example:**`74855f4a-2b61-429c-81d8-c79ad3675a76`

**context** Context (string)

**Possible values:** [`contact`, `company`, `deal`, `project`, `milestone`, `product`, `invoice`, `subscription`, `ticket`]

**Example:**`contact`

**type** CustomFieldDefinitionType (string)

**Possible values:** [`single_line`, `multi_line`, `single_select`, `multi_select`, `date`, `money`, `auto_increment`, `integer`, `number`, `boolean`, `email`, `telephone`, `url`, `company`, `contact`, `product`, `user`]

**label** string

**group** string

**required** boolean

**Example:**`false`

**configuration** object

**options** object[]

Only returned for `single_select` and `multi_select` types

  * Array [

**id** string

**Example:**`179e1564-493b-4305-8c54-a34fc80920fc`

**value** string

**Example:**`foo`

  * ]

**extra_option_allowed** boolean

**Example:**`true`



    
    
    {  
      "data": {  
        "id": "57e851e2-3d3b-4523-82f8-fe77df5a5d6c",  
        "context": "contact",  
        "type": "single_line",  
        "label": "",  
        "group": "",  
        "required": false,  
        "configuration": {  
          "options": [  
            {  
              "id": "179e1564-493b-4305-8c54-a34fc80920fc",  
              "value": "foo"  
            }  
          ],  
          "extra_option_allowed": true  
        }  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "57e851e2-3d3b-4523-82f8-fe77df5a5d6c",  
        "context": "contact",  
        "type": "single_line",  
        "label": "",  
        "group": "",  
        "required": false,  
        "configuration": {  
          "options": [  
            {  
              "id": "179e1564-493b-4305-8c54-a34fc80920fc",  
              "value": "foo"  
            }  
          ],  
          "extra_option_allowed": true  
        }  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/customFieldDefinitions.info");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"9c64570b-4ec1-4e03-9662-af904f78f7fa\"\n}", null, "application/json");  
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
      "id": "9c64570b-4ec1-4e03-9662-af904f78f7fa"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
