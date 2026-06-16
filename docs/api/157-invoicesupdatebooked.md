# invoices.updateBooked

> Source: https://developer.focus.teamleader.eu/docs/api/invoices-update-booked

  * [](/)
  * [API Reference](/docs/api)
  * Invoicing
  * [Invoices](/docs/api/invoices)
  * invoices.updateBooked



# invoices.updateBooked
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/invoices.updateBooked

Update a booked invoice. Only available when editing booked invoices is allowed through the settings.

## Request​

  * application/json



### Body**required**

**id** stringrequired

**Example:**`b7023c11-455e-4fa5-bb96-87f37dbc7d07`

**invoicee** object

**customer** objectrequired

**type** stringrequired

**Possible values:** [`contact`, `company`]

**Example:**`contact`

**id** stringrequired

**Example:**`f29abf48-337d-44b4-aad4-585f5277a456`

**for_attention_of** object

oneOf

    * By Name
    * By Contact Id

**name** stringrequired

**Example:**`Finance Dept.`

**contact_id** stringrequired

**Example:**`417a2231-c3c7-4e1c-a6bb-1b014836ca60`

**payment_term** objectnullable

**type** string

**Possible values:** [`cash`, `end_of_month`, `after_invoice_date`]

**days** number

Modifier "X" for the above statements. Not required when type is 'cash'.

**project_id** string

**Example:**`624ca743-8998-4f8c-add1-c427bb022166`

**grouped_lines** object[]

  * Array [

**section** object

**title** stringrequired

**line_items** object[]required

  * Array [

**quantity** numberrequired

**Example:**`3`

**description** stringrequired

**Example:**`An awesome product`

**extended_description** stringnullable

Uses Markdown formatting

**Example:**`Some more information about this awesome product`

**unit_of_measure_id** stringnullable

**Example:**`f79d3e04-b8dc-0637-8f18-ca7c8fc63b71`

**unit_price** object

**amount** numberrequired

**Example:**`123.3`

**tax** stringrequired

**Possible values:** [`excluding`]

**Example:**`excluding`

**tax_rate_id** stringrequired

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585823`

**discount** object

**value** numberrequired

**Example:**`10`

**type** stringrequired

Values between 0 and 100

**Possible values:** [`percentage`]

**Example:**`percentage`

**product_id** string

**Example:**`d905ff57-e866-0f59-9d1e-1fd4538bfae1`

**withholding_tax_rate_id** string

**Example:**`c0c03f1e-77e3-402c-a713-30ea1c585824`

**product_category_id** string

**Example:**`e2314517-3cab-4aa9-8471-450e73449041`

  * ]

  * ]

**invoice_date** string

**Example:**`2016-02-04`

**note** stringnullable

**Example:**`Some comments about the invoice`

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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/invoices.updateBooked");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"b7023c11-455e-4fa5-bb96-87f37dbc7d07\",\n  \"invoicee\": {\n    \"customer\": {\n      \"type\": \"contact\",\n      \"id\": \"f29abf48-337d-44b4-aad4-585f5277a456\"\n    },\n    \"for_attention_of\": {\n      \"name\": \"Finance Dept.\"\n    }\n  },\n  \"payment_term\": {\n    \"type\": \"cash\",\n    \"days\": 0\n  },\n  \"project_id\": \"624ca743-8998-4f8c-add1-c427bb022166\",\n  \"grouped_lines\": [\n    {\n      \"section\": {\n        \"title\": \"string\"\n      },\n      \"line_items\": [\n        {\n          \"quantity\": 3,\n          \"description\": \"An awesome product\",\n          \"extended_description\": \"Some more information about this awesome product\",\n          \"unit_of_measure_id\": \"f79d3e04-b8dc-0637-8f18-ca7c8fc63b71\",\n          \"unit_price\": {\n            \"amount\": 123.3,\n            \"tax\": \"excluding\"\n          },\n          \"tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585823\",\n          \"discount\": {\n            \"value\": 10,\n            \"type\": \"percentage\"\n          },\n          \"product_id\": \"d905ff57-e866-0f59-9d1e-1fd4538bfae1\",\n          \"withholding_tax_rate_id\": \"c0c03f1e-77e3-402c-a713-30ea1c585824\",\n          \"product_category_id\": \"e2314517-3cab-4aa9-8471-450e73449041\"\n        }\n      ]\n    }\n  ],\n  \"invoice_date\": \"2016-02-04\",\n  \"note\": \"Some comments about the invoice\",\n  \"custom_fields\": [\n    {\n      \"id\": \"bf6765de-56eb-40ec-ad14-9096c5dc5fe1\",\n      \"value\": \"092980616\"\n    }\n  ]\n}", null, "application/json");  
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
    
    
    {
      "id": "b7023c11-455e-4fa5-bb96-87f37dbc7d07",
      "invoicee": {
        "customer": {
          "type": "contact",
          "id": "f29abf48-337d-44b4-aad4-585f5277a456"
        },
        "for_attention_of": {
          "name": "Finance Dept."
        }
      },
      "payment_term": {
        "type": "cash",
        "days": 0
      },
      "project_id": "624ca743-8998-4f8c-add1-c427bb022166",
      "grouped_lines": [
        {
          "section": {
            "title": "string"
          },
          "line_items": [
            {
              "quantity": 3,
              "description": "An awesome product",
              "extended_description": "Some more information about this awesome product",
              "unit_of_measure_id": "f79d3e04-b8dc-0637-8f18-ca7c8fc63b71",
              "unit_price": {
                "amount": 123.3,
                "tax": "excluding"
              },
              "tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585823",
              "discount": {
                "value": 10,
                "type": "percentage"
              },
              "product_id": "d905ff57-e866-0f59-9d1e-1fd4538bfae1",
              "withholding_tax_rate_id": "c0c03f1e-77e3-402c-a713-30ea1c585824",
              "product_category_id": "e2314517-3cab-4aa9-8471-450e73449041"
            }
          ]
        }
      ],
      "invoice_date": "2016-02-04",
      "note": "Some comments about the invoice",
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
