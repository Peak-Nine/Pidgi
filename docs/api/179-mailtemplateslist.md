# mailTemplates.list

> Source: https://developer.focus.teamleader.eu/docs/api/mail-templates-list

  * [](/)
  * [API Reference](/docs/api)
  * Templates
  * [Mail Templates](/docs/api/mail-templates)
  * mailTemplates.list



# mailTemplates.list
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/mailTemplates.list

Get a list of all mail templates.

## Request​

  * application/json;charset=utf-8



### Body**required**

**filter** objectrequired

**department_id** string

**Example:**`a344c251-2494-0013-b433-ccee8e8435e5`

**type** stringrequired

**Possible values:** [`invoice`, `quotation`, `work_order`, `credit_note`]

**Example:**`invoice`




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

**department** objectnullable

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**name** string

**Example:**`Send link in english`

**content** object

**subject** string

**Example:**`Link for document`

**body** string

**Example:**`#LINK \n<link> Thank you for using our services`

**language** string

**Example:**`en`

**type** string

**Possible values:** [`invoice`, `quotation`, `work_order`, `credit_note`]

**Example:**`invoice`

  * ]



    
    
    {  
      "data": [  
        {  
          "id": "a344c251-2494-0013-b433-ccee8e8435e5",  
          "department": {  
            "type": "department",  
            "id": "36386b05-936e-4cc0-9523-bd20d797ebf5"  
          },  
          "name": "Send link in english",  
          "content": {  
            "subject": "Link for document",  
            "body": "#LINK \\n<link> Thank you for using our services"  
          },  
          "language": "en",  
          "type": "invoice"  
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
          "name": "Send link in english",  
          "content": {  
            "subject": "Link for document",  
            "body": "#LINK \\n<link> Thank you for using our services"  
          },  
          "language": "en",  
          "type": "invoice"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/mailTemplates.list");  
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
