# quotations.send

> Source: https://developer.focus.teamleader.eu/docs/api/quotations-send

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Quotations](/docs/api/quotations)
  * quotations.send



# quotations.send
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/quotations.send

Send a quotation.

## Request​

  * application/json



### Body**required**

**quotations** string[]required

list of quotation ids you wish to send. These quotations need to come from the same deal.

**from** object

**sender** objectrequired

**type** stringrequired

**Possible values:** [`user`, `department`]

**id** stringrequired

**Example:**`2659dc4d-444b-4ced-b51c-b87591f604d7`

**email_address** stringrequired

**Example:**`info@teamleader.eu`

**recipients** objectrequired

**to** object[]required

  * Array [

**customer** objectnullable

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**email_address** stringrequired

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

**email_address** stringrequired

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

**email_address** stringrequired

**Example:**`info@teamleader.eu`

  * ]

**subject** stringrequired

**Example:**`An offer you cannot refuse`

**content** stringrequired

the shortcode '#LINK' will be replaced with the cloudsign url

**Example:**`Sign your offer here #LINK`

**attachments** string[]

an array of file ids

**language** QuotationLanguage (string)required

**Possible values:** [`en`, `nl`, `fr`, `ch`, `jp`, `de`, `es`, `pt`, `it`, `gr`, `tr`, `cs`, `so`, `sk`, `ru`, `ko`, `ir`, `iq`, `hu`, `gh`, `bg`, `bs`, `br`, `ar`, `ag`, `al`, `af`, `ro`, `pl`, `ca`, `da`, `uk`, `no`, `fi`, `sv`]




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/quotations.send");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"quotations\": [\n    \"023a4609-eda4-006c-8d2c-314539ec5d85\",\n    \"b42635b7-ccd3-0bfc-9628-e90940694845\"\n  ],\n  \"from\": {\n    \"sender\": {\n      \"type\": \"user\",\n      \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n    },\n    \"email_address\": \"info@teamleader.eu\"\n  },\n  \"recipients\": {\n    \"to\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email_address\": \"info@teamleader.eu\"\n      }\n    ],\n    \"cc\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email_address\": \"info@teamleader.eu\"\n      }\n    ],\n    \"bcc\": [\n      {\n        \"customer\": {\n          \"type\": \"company\",\n          \"id\": \"2659dc4d-444b-4ced-b51c-b87591f604d7\"\n        },\n        \"email_address\": \"info@teamleader.eu\"\n      }\n    ]\n  },\n  \"subject\": \"An offer you cannot refuse\",\n  \"content\": \"Sign your offer here #LINK\",\n  \"attachments\": [\n    \"e76d381a-f7ea-04d1-9a32-14aab27bc1e2\"\n  ],\n  \"language\": \"en\"\n}", null, "application/json");  
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
      "quotations": [
        "023a4609-eda4-006c-8d2c-314539ec5d85",
        "b42635b7-ccd3-0bfc-9628-e90940694845"
      ],
      "from": {
        "sender": {
          "type": "user",
          "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
        },
        "email_address": "info@teamleader.eu"
      },
      "recipients": {
        "to": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email_address": "info@teamleader.eu"
          }
        ],
        "cc": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email_address": "info@teamleader.eu"
          }
        ],
        "bcc": [
          {
            "customer": {
              "type": "company",
              "id": "2659dc4d-444b-4ced-b51c-b87591f604d7"
            },
            "email_address": "info@teamleader.eu"
          }
        ]
      },
      "subject": "An offer you cannot refuse",
      "content": "Sign your offer here #LINK",
      "attachments": [
        "e76d381a-f7ea-04d1-9a32-14aab27bc1e2"
      ],
      "language": "en"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
