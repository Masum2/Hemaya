using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.IO;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.SpaServices;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddHttpClient("AzureProxy");

// Service and CORS configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5205")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors();
app.UseRouting();
app.UseAuthorization();

app.MapRazorPages();


app.Use(async (context, next) =>
{
    if (context.Request.Path.Value?.StartsWith("/api", StringComparison.OrdinalIgnoreCase) == true)
    {
        var httpClientFactory = context.RequestServices.GetRequiredService<IHttpClientFactory>();
        var httpClient = httpClientFactory.CreateClient("AzureProxy");

        var targetUrl = $"https://pechangatesthemaiya.azurewebsites.net{context.Request.Path}{context.Request.QueryString}";
        var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUrl);

        
        if (!HttpMethods.IsGet(context.Request.Method) &&
            !HttpMethods.IsHead(context.Request.Method) &&
            !HttpMethods.IsDelete(context.Request.Method))
        {
            context.Request.EnableBuffering();
            var streamContent = new StreamContent(context.Request.Body);
            requestMessage.Content = streamContent;
        }

        foreach (var header in context.Request.Headers)
        {
            if (header.Key.Equals("Host", StringComparison.OrdinalIgnoreCase) ||
                header.Key.Equals("Cookie", StringComparison.OrdinalIgnoreCase)) 
                continue;

            if (header.Key.StartsWith("Content-", StringComparison.OrdinalIgnoreCase))
            {
                if (requestMessage.Content != null)
                {
                    requestMessage.Content.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
                }
            }
            else
            {
                requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
            }
        }

        requestMessage.Headers.Host = "pechangatesthemaiya.azurewebsites.net";

      
        string freshLiveCookie = "ARRAffinity=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; ARRAffinitySameSite=a6e48b9e9d2653435be7b61998d8624b44115214104213d6c8b8c526cc56dc70; .AspNetCore.Antiforgery.cdV5uW_Ejgc=CfDJ8LbtibfgVHBJjONX366BUVnCKTD6pV2dPJZyFiElAxPWLmmf_bFf5Mw-rnRcvXWULVl0jqWm3ITzkbMob9bg2SHIdCt_4exPDY6873MdP1WFzrmMxxtAM9xHaFlx1gzOIoF8vMPeOI_c3aliOOrvA8k; .AspNetCore.Session=CfDJ8LbtibfgVHBJjONX366BUVnQ8epYqY3SbqT7oIT97kRuSEVGjLUBXvEC20vV1hEP1r1W2oyunQJ2cRui%2BX3mbjau4bu1ZF%2FB8o467AFGwk%2BaJLjscPZcMzJqO0dLFycppvZQCtaIXSMMq3OI5AHjM30R%2FC0X5%2FE%2BSn5AIzDuB7gy; .AspNetCore.Cookies=CfDJ8LbtibfgVHBJjONX366BUVnvaTXlukMjfbuCwZK8YWKtES4Bqt2WrrjtNE73opjhVPw0UPmSw_iC3XINBL3aSo8GSpqphVwj5Ay6EDwz0uPuNXxVW1jsYyNTygj07lLJzxaTYnzR8YFdJG2qewPVGWNPuRGAYhUAm5zP41JwB_cMbbwWhhZq_2G9z0iED4KldES3v6BwnnthUJ8rk29VAfBvyZ4l8ntgvTMz63JBxq9VvbbD_NDzJMwpTTQcIMNYorRyIWc6Vj983sqW_GTGRYs2estkBjwdsFczmwomLKJKQW4CrnDoiJQzYdzoG_irvT-kOkpXv6T2i0jxw9wTu7kHgppqhIu2a_z4651K6SnrWVCSDLhQUI6ZGaGL9qzUeq-SwBleEhJyD2zS6GuI5iQtsjEJzWMazBrJzhg99iqwSv8w3ErQqOZkbWhmhl_eu_j6gKnPT_B9RmZcNVFHutOkHLOwaRhVR21P6onHEXyVSy_ScmLLZih3DJMCSXOfGz0BXFOW_oQx8wul34QKdBBlC_Yo4mON7FMdsYsR5BWnLCQ5DO4pPK6g311s0_49vdtYJ756X2nRm3VX07AsJuig0b2UZFYeE8LOH6EWiCfyZhqVGyG_dODV4hur_aP4m16EphhX6ytP-fPGq9hSEBJAeqJsHPRd3ZESaU4MwGmIrWaHrK_BODJSp4rtgt5G2HGHD7_NroSe8JWrEAvNVlhdwBOw6O3Cn5MJ-vbLZvjtgwRJbGTCyQx3bllVTvp8ZG-8rmYsvFJhf5_lpZWS0FzHUnwGCp49qRJ1ehiiD3xIW4SEaOT0L9O-8EsKAOpsCqiYr9-E-npQ5wovKCDHR9BGaglEitJrEimQ--iBNcO0cM8LHiQ-WPF4CPL1gsQ-bfO0J7hKOx4Ea02UneZu71zjra374srGLuO50qT4zpYyG_Cj5sdyMW3T9j4656Wt9XXsRRvZmBwHSsHKLU4_IshfE-BDk9HRxYl8xdNTUbZm0aWqDv0Dj-DyfhW4POgu0sqwgDCGi2OwJL87Wxbe1ZVFzCu6iYeZuhtvzbtAOIpgK4JmHnaIhpwi5ocXGYsceoy0tuW3yGRhEdhxuxrVs-FmgAGjIAfH-kCEN-ej2-EmjIwiILiN5eFixUlJM16QKDaqemPG6xUMPA92DG7JxG9dXlyH6RqJaKHXD-UkO0S2SIPhyMXE9qZV-y27R_cPnWpUyEb97rT54ErrKcmO9ZHaihtjoX289Of6_HHjmOhYJphKGPbB6qPB6CADqgJw37HGgZ2u-dZ8piHXJuqBLPcE8qKsXfUOmPUS1XcC9WNGPTVTREABIwV0lZZAUwLIRf2DltUDpgLRDPvwI77IAZMHXIifWdUf3bkQvNBMeKm1QbUPEkCgSASSbrlnYGK9j1WYVJlZj0LvkFXE-DGP49Xo5N2o8xpZBw8Y-xiMKllDDeJNWcktaszNbtcq1x2QMBX7pGPZ8akPkf8R9s2rlW2t7YtOuX0HtYCWfc7XSIua4QC2WvQxLY3Pwimw30GZmH5_dlDtJCeqMwC95_SGdzwQ96sXWqmJ32KnQf6lgBjNytUm3IaNcd7wic8mXYpIn7U4_6t12FlGSpE1wxQkRSplk6LjsUs_Jga9uZ5GLeU8p5Uz_v8vk8I4H-cLWvSE3fuR1EjMBO6iq6yd-SMHbOngfZiT6ermy1mypIadKEtJY66S-l-7guoBbzjsYi9NlIHXAS4S_PM2Vr5P2lByEm5xfJSyIDfO5N3jG6k5BkM8QNgeAc7d7EjXIE1XFjTsj-nwhkw8DYFDYHM_Yyrm8k9zIuhaNylG3Ow6Rzrb_X7qSJSywiFMDHW9R2jEJia3YQntBcdCJ1JOv_x45NdMaDWwEIo50phN1wvEI8ZHg5annJpfGaLkK5_MG7TRrwA1Cea_GRgdFQxgGDbBu8XFkCAYEYw1PV7TPY44UK20H0fLDDDbYw46pKIQhcfBgU9TLJWSwop-F9ISyFoC6qikWXPeSu49JvI_ImgkdANfzGNqGraIMGLaGg5bdPGwFOBpGEYiNprPAs0Cw1RYJR4dBz7rTI9L9n3f4bk2K9GqexTSVC7_j1ii5TUBi9dKVieQw4pIleprQxbxHNUVL_PTFBOxKLDq8NwxndEpKB9sM9sNUCZZF812MyevqAJjpeXiaFd-OC4mKpfUn33OSfBYp7WbQglJR1yuaMsEcOJy8wWkOBh7le6flUTwETM997nH4igk_4mpdnzGeCW2XLmPw6ThaNXnH7VkKL6vgxxKNO00WmramStn7uZNg69Mx1fLx6kzryIBrbic04YcRXtJ_vy053pUpkr3tVKmW-qvUU4XyDBSB5Bkh2ktetSQOQGOxdNdSzEz63oLsr_hqKxU3qA";

        requestMessage.Headers.TryAddWithoutValidation("Cookie", freshLiveCookie);

        var responseMessage = await httpClient.SendAsync(requestMessage);

        context.Response.StatusCode = (int)responseMessage.StatusCode;

        foreach (var header in responseMessage.Headers)
        {
            if (!header.Key.Equals("Transfer-Encoding", StringComparison.OrdinalIgnoreCase) &&
                !header.Key.Equals("Connection", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.Headers[header.Key] = header.Value.ToArray();
            }
        }

        foreach (var header in responseMessage.Content.Headers)
        {
            context.Response.Headers[header.Key] = header.Value.ToArray();
        }

        await responseMessage.Content.CopyToAsync(context.Response.Body);
        return;
    }

    await next();
});


app.MapWhen(context => context.Request.Path.StartsWithSegments("/admin"), adminApp =>
{
    adminApp.UseStaticFiles();

    adminApp.UseSpa(spa =>
    {
        if (app.Environment.IsDevelopment())
        {
        
            spa.UseProxyToSpaDevelopmentServer("http://localhost:54080");
        }
        else
        {
            spa.Options.SourcePath = "wwwroot/admin";
        }
    });
});

app.MapFallbackToFile("admin/index.html");

app.Run();