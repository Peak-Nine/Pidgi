# documentTemplates.list

> Source: https://developer.focus.teamleader.eu/docs/api/document-templates-list

  * [](/)
  * [API Reference](/docs/api)
  * General
  * [Document Templates](/docs/api/document-templates)
  * documentTemplates.list



# documentTemplates.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/documentTemplates.list

Get a list of all document templates.

## Request​

  * application/json;charset=utf-8



### Body**required**

**filter** objectrequired

**department_id** stringrequired

**Example:**`a344c251-2494-0013-b433-ccee8e8435e5`

**document_type** DocumentType (string)required

**Possible values:** [`delivery_note`, `invoice`, `order`, `order_confirmation`, `quotation`, `timetracking_report`, `workorder`]

**Example:**`invoice`

**status** string[]

Filters on status:

    * `active` \- Filters on active departments
    * `archived` \- Filters on archived departments

**Possible values:** [`active`, `archived`]




## Responses​

  * 200



**Response Headers**




  * application/json;charset=utf-8



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object[]

  * Array [

**id** string

**Example:**`a344c251-2494-0013-b433-ccee8e8435e5`

**department** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Example:**`department`

**document_type** DocumentType (string)

**Possible values:** [`delivery_note`, `invoice`, `order`, `order_confirmation`, `quotation`, `timetracking_report`, `workorder`]

**Example:**`invoice`

**is_default** boolean

**Example:**`true`

**name** string

**Example:**`new logo`

**status** string

**Possible values:** [`active`, `archived`]

**Example:**`active`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "a344c251-2494-0013-b433-ccee8e8435e5",  
          "department": {  
            "type": "department",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "document_type": "invoice",  
          "is_default": true,  
          "name": "new logo",  
          "status": "active"  
        }  
      ]  
    }  
    
    
    
    {  
      "data": [  
        {  
          "id": "a344c251-2494-0013-b433-ccee8e8435e5",  
          "department": {  
            "type": "department",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "document_type": "invoice",  
          "is_default": true,  
          "name": "new logo",  
          "status": "active"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/documentTemplates.list");  
    request.Headers.Add("Accept", "application/json;charset=utf-8");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("", null, "application/json;charset=utf-8");  
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


    
    
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
