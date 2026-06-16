# invoices.send

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-send

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.send



# invoices.send
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.send

Send an invoice via e-mail.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`d885e5d5-bacb-4607-bde9-abc4a04a901b`

**content** objectrequired

**subject** stringrequired

**Example:**`Invoice`

**body** stringrequired

**Example:**`Please find your invoice attached to this mail`

**mail_template_id** stringnullable

**Example:**`045cd6a9-7527-09c9-aa16-fd5ac7953e71`

**recipients** object

**to** object[]

  * Array [

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**email** stringrequired

**Example:**`info@teamleader.eu`

  * ]

**cc** object[]

  * Array [

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**email** stringrequired

**Example:**`info@teamleader.eu`

  * ]

**bcc** object[]

  * Array [

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**email** stringrequired

**Example:**`info@teamleader.eu`

  * ]

**attachments** string[]

an array of file ids




## Responses​

  * 204



**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.send");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"d885e5d5-bacb-4607-bde9-abc4a04a901b\",\n  \"content\": {\n    \"subject\": \"Invoice\",\n    \"body\": \"Please find your invoice attached to this mail\",\n    \"mail_template_id\": \"045cd6a9-7527-09c9-aa16-fd5ac7953e71\"\n  },\n  \"recipients\": {\n    \"to\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email\": \"info@teamleader.eu\"\n      }\n    ],\n    \"cc\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email\": \"info@teamleader.eu\"\n      }\n    ],\n    \"bcc\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email\": \"info@teamleader.eu\"\n      }\n    ]\n  },\n  \"attachments\": [\n    \"e76d381a-f7ea-04d1-9a32-14aab27bc1e2\"\n  ]\n}", null, "application/json");  
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
      "content": {
        "subject": "Invoice",
        "body": "Please find your invoice attached to this mail",
        "mail_template_id": "045cd6a9-7527-09c9-aa16-fd5ac7953e71"
      },
      "recipients": {
        "to": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email": "info@teamleader.eu"
          }
        ],
        "cc": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email": "info@teamleader.eu"
          }
        ],
        "bcc": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email": "info@teamleader.eu"
          }
        ]
      },
      "attachments": [
        "e76d381a-f7ea-04d1-9a32-14aab27bc1e2"
      ]
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
