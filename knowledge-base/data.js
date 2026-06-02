const posts = [
{
    id: "solid-principles",
    file: "post_01.md",
    date: "Jun 2026",
    readTime: "9 min read",
    title: "Understanding SOLID Principles in C#",

    description:
        "A practical overview of SOLID principles in C# with real-world architectural insights, maintainability tradeoffs, and clean design practices.",

    tags: ["C#", ".NET", "SOLID", "Clean Architecture"],

    content: `

<p>
    Most .NET developers learn SOLID early — yet many production systems still become
    tightly coupled, difficult to test, and painful to extend. The problem is rarely
    the principles themselves. It's applying them mechanically, without ever asking
    which architectural boundaries actually need protecting.
</p>

<p>
    Over the years, working across APIs, layered applications, and enterprise systems
    where requirements changed constantly, I came to appreciate SOLID for one reason
    above all: it reduces the impact of change. Not because it makes architecture look
    clean — but because it gives change somewhere controlled to land.
</p>

<h3>What is SOLID?</h3>

<p>
    SOLID is a set of object-oriented design principles that reduce tight coupling
    and improve maintainability. The acronym breaks down like this:
</p>

<ul>
    <li><strong>S</strong> → Single Responsibility Principle (SRP) — one reason to change</li>
    <li><strong>O</strong> → Open/Closed Principle (OCP) — open for extension, closed for modification</li>
    <li><strong>L</strong> → Liskov Substitution Principle (LSP) — subtypes must honor their base type's contract</li>
    <li><strong>I</strong> → Interface Segregation Principle (ISP) — don't depend on methods you don't use</li>
    <li><strong>D</strong> → Dependency Inversion Principle (DIP) — depend on abstractions, not concretions</li>
</ul>

<p>
    These principles become more valuable as systems grow and business requirements
    evolve. In a small, stable codebase they can feel like overhead. In a large system
    touched by multiple developers — with infrastructure that changes and features
    that evolve independently — they start paying real dividends.
</p>

<h3>Project Structure</h3>

<pre><code>SOLIDPrinciples/
│
├── Models/
│   └── Wallet.cs
│
├── Services/
│   ├── WalletService.cs
│   ├── WalletReportService.cs
│   └── WalletExportService.cs
│
├── Notifications/
│   ├── IWalletNotificationService.cs
│   ├── EmailWalletNotificationService.cs
│   └── SmsWalletNotificationService.cs
│
└── Program.cs</code></pre>

<h3>Example Model</h3>

<pre><code class="language-csharp">public class Wallet
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Currency { get; set; } = string.Empty;

    public decimal Balance { get; set; }
}</code></pre>

<h3>1. Single Responsibility Principle (SRP)</h3>

<p>
    A class should have one reason to change. In practice, production classes tend
    to accumulate responsibilities over time — business logic, reporting, exports,
    and validation all quietly move in. The trouble is that these concerns evolve at
    completely different speeds. When they share a class, a reporting change forces
    you to touch business logic code, and vice versa.
</p>

<p><strong>Bad Example:</strong></p>

<pre><code class="language-csharp">public class WalletService
{
    public void CreateWallet(Wallet wallet)
    {
        // Save wallet
    }

    public void PrintWalletReport(Wallet wallet)
    {
        Console.WriteLine(wallet.Name);
    }

    public void ExportWalletsToCsv(List&lt;Wallet&gt; wallets)
    {
        // Export logic
    }
}</code></pre>

<p>
    This service will be edited for business logic updates, reporting changes, and
    export format changes — three separate pressures on a single class. That coupling
    makes testing harder and every change riskier.
</p>

<p><strong>Better Example:</strong></p>

<pre><code class="language-csharp">public class WalletService
{
    public void CreateWallet(Wallet wallet)
    {
        // Save wallet
    }
}

public class WalletReportService
{
    public void PrintWalletReport(Wallet wallet)
    {
        Console.WriteLine(wallet.Name);
    }
}

public class WalletExportService
{
    public void ExportToCsv(List&lt;Wallet&gt; wallets)
    {
        // Export logic
    }
}</code></pre>

<p>
    Now each class changes for one reason only. You can update the CSV export logic
    without ever opening <code>WalletService</code>, and you can test each service in isolation.
</p>

<h3>2. Open/Closed Principle (OCP)</h3>

<p>
    SRP gives each class one job. But once responsibilities are separated, a new
    challenge appears: how do you add behavior without reopening code you've already
    tested? That's what OCP solves — software entities should be open for extension,
    but closed for modification.
</p>

<p>
    Consider a wallet service that needs to notify users. If you hard-code the
    notification channel, adding SMS means editing code that already works:
</p>

<pre><code class="language-csharp">public interface IWalletNotificationService
{
    void Send(string message);
}</code></pre>

<pre><code class="language-csharp">public class EmailWalletNotificationService
    : IWalletNotificationService
{
    public void Send(string message)
    {
        Console.WriteLine($"Email Sent: {message}");
    }
}

public class SmsWalletNotificationService
    : IWalletNotificationService
{
    public void Send(string message)
    {
        Console.WriteLine($"SMS Sent: {message}");
    }
}</code></pre>

<pre><code class="language-csharp">public class WalletService
{
    private readonly IWalletNotificationService _notificationService;

    public WalletService(
        IWalletNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public void CreateWallet(Wallet wallet)
    {
        _notificationService.Send(
            "Wallet created successfully");
    }
}</code></pre>

<p>
    Adding a push notification provider now means writing a new class —
    <code>WalletService</code> never has to open. In real systems, this pattern shows up
    constantly: payment gateways, notification providers, storage backends,
    and authentication handlers all benefit from it.
</p>

<p>
    That said, watch out for over-abstraction. Creating an interface for every class —
    before any variation actually exists — adds indirection without adding value.
    The interface earns its place when you have, or genuinely expect, multiple implementations.
</p>

<h3>3. Liskov Substitution Principle (LSP)</h3>

<p>
    OCP gets you extensibility through abstraction. LSP is the rule that keeps those
    abstractions honest: derived classes must be substitutable for their base types
    without breaking application behavior.
</p>

<p>
    Imagine calling <code>GetBalance()</code> on a <code>Wallet</code> and receiving -200,
    because a subclass silently applies overdraft rules the caller never expected.
    That's an LSP violation — and it's why these bugs tend to surface as hard-to-trace
    runtime failures rather than compile errors.
</p>

<pre><code class="language-csharp">public abstract class Wallet
{
    public abstract decimal GetBalance();
}

public class SavingsWallet : Wallet
{
    public override decimal GetBalance()
    {
        return 5000;
    }
}

public class BusinessWallet : Wallet
{
    public override decimal GetBalance()
    {
        return 25000;
    }
}</code></pre>

<p>
    Any code that accepts a <code>Wallet</code> can work with <code>SavingsWallet</code> or
    <code>BusinessWallet</code> interchangeably — same contract, predictable behavior.
    In larger systems, LSP violations usually creep in when inheritance is forced onto
    relationships that would be safer modeled with composition.
</p>

<h3>4. Interface Segregation Principle (ISP)</h3>

<p>
    LSP keeps subtypes honest. ISP extends that discipline to interfaces themselves:
    clients should not be forced to depend on methods they don't use. A bloated
    interface imposes coupling just as surely as a bloated class.
</p>

<p><strong>Bad Example:</strong></p>

<pre><code class="language-csharp">public interface IWalletActions
{
    void Deposit();
    void Withdraw();
    void GenerateReport();
    void ExportTransactions();
}</code></pre>

<p>
    A transaction service implementing this interface has to carry reporting and export
    methods it will never call. That dead weight makes testing noisier and change riskier.
</p>

<p><strong>Better Example:</strong></p>

<pre><code class="language-csharp">public interface IWalletTransactions
{
    void Deposit();
    void Withdraw();
}

public interface IWalletReports
{
    void GenerateReport();
}

public interface IWalletExports
{
    void ExportTransactions();
}</code></pre>

<p>
    Smaller interfaces are also much easier to mock in tests — you implement only
    what the component under test actually needs.
</p>

<h3>5. Dependency Inversion Principle (DIP)</h3>

<p>
    ISP keeps interfaces lean. DIP is the structural principle that connects them all:
    high-level modules should not depend on low-level modules — both should depend on
    abstractions. We already saw this with <code>IWalletNotificationService</code>, but it's
    worth spelling out why it matters at scale.
</p>

<pre><code class="language-csharp">public interface IWalletNotificationService
{
    void Send(string message);
}</code></pre>

<pre><code class="language-csharp">public class EmailWalletNotificationService
    : IWalletNotificationService
{
    public void Send(string message)
    {
        Console.WriteLine(message);
    }
}</code></pre>

<pre><code class="language-csharp">public class WalletService
{
    private readonly IWalletNotificationService
        _notificationService;

    public WalletService(
        IWalletNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public void CreateWallet(Wallet wallet)
    {
        _notificationService.Send(
            "Wallet created successfully");
    }
}</code></pre>

<p>
    <code>WalletService</code> doesn't know — or care — whether notifications go by email,
    SMS, or carrier pigeon. That ignorance is intentional: it means swapping the
    notification provider requires zero changes to business logic. In enterprise systems,
    DIP becomes especially useful when replacing external APIs, message brokers,
    storage systems, or auth providers.
</p>

<h3>Where Developers Commonly Overengineer SOLID</h3>

<p>
    One pattern I've seen repeatedly in enterprise .NET codebases is introducing
    abstractions before any variation actually exists:
</p>

<pre><code class="language-csharp">IWalletService
IWalletRepository
IWalletManager
IWalletProvider
IWalletFactory</code></pre>

<p>
    In a small application with one implementation per interface, this creates
    indirection without creating value. You end up navigating five files to understand
    one operation — and future developers spend more time deciphering the structure
    than understanding the business problem.
</p>

<p>
    Good architecture is not measured by how many abstractions it contains.
    It's measured by how safely the system can evolve when requirements change.
</p>

<h3>How SOLID Helps in Real Systems</h3>

<p>
    In layered or Clean Architecture-based applications, these principles collectively
    reduce what I think of as the <em>blast radius</em> of change — how many files you
    have to touch when one requirement shifts. That matters most when:
</p>

<ul>
    <li>multiple developers are working on the same codebase</li>
    <li>features evolve independently and at different rates</li>
    <li>infrastructure — databases, queues, notification providers — gets swapped</li>
    <li>the system will be maintained for years, not months</li>
</ul>

<p>
    The main benefit isn't "clean code." It's controlled complexity — knowing that
    a change to the email provider won't ripple into your transaction logic.
</p>

<h3>Key Takeaways</h3>

<ul>
    <li>SOLID reduces tight coupling — but only where coupling is actually a problem</li>
    <li>Separated responsibilities make components easier to test and evolve independently</li>
    <li>Smaller, focused interfaces reduce the surface area of every dependency</li>
    <li>Good abstractions pay off at the seams where things actually change</li>
    <li>Premature abstraction is its own form of technical debt — add it when variation exists, not before</li>
    <li>Architecture should grow in response to real pressure, not anticipated perfection</li>
</ul>

<h3>Final Note</h3>

<p>
    The real litmus test for any abstraction isn't "does this look SOLID?" It's:
    will this still make sense in six months when the requirements change? If a boundary
    protects something that genuinely varies independently — a notification channel,
    a payment gateway, a storage backend — it earns its place. If it's there because
    someone once said "you should always program to an interface," it's probably just noise.
</p>

<p>
    SOLID is a tool for managing real complexity, not a checklist for looking like
    a serious engineer. Use it where the system pushes back.
</p>
`
},
];