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

{
    id: "repository-pattern",
    file: "post_02.md",
    date: "Jun 2026",
    readTime: "7 min read",

    title: "Understanding the Repository Pattern in C#",

    description:
        "A practical overview of the Repository Pattern in C# with real-world architectural tradeoffs, maintainability insights, and separation of concerns.",

    tags: ["C#", ".NET", "Repository Pattern", "Layered Architecture"],

    content: `

<p>
    Most applications start simple — and then quietly don't. Persistence logic
    that began in one service spreads into controllers, background jobs, and API
    handlers. Before long, you have database concerns woven through every layer
    of the codebase, and changing one thing means touching five others.
</p>

<p>
    The Repository Pattern is commonly used to stop that spread: it isolates
    persistence concerns from business logic and centralizes data access behavior
    in one place. Over the years, working across APIs, layered applications, and
    enterprise systems where database logic evolved independently from business
    requirements, I've found repositories valuable for one specific reason — they
    prevent infrastructure concerns from leaking into application logic. Not
    because they add abstraction, but because they give that abstraction a clear
    home.
</p>

<h3>What is the Repository Pattern?</h3>

<p>
    The Repository Pattern introduces a dedicated layer responsible for data access
    operations. Instead of letting services or controllers talk directly to the
    database, repositories act as the boundary between business logic and persistence
    concerns. Your service asks for a wallet by ID; it doesn't need to know whether
    that wallet lives in SQL Server, an in-memory list, or somewhere else entirely.
</p>

<p>
    That separation improves maintainability and testability — and in layered
    applications, it makes the distinction between "what the system does" and
    "how it stores things" explicit and enforceable.
</p>

<h3>Project Structure</h3>

<pre><code>RepositoryPattern/
│
├── Models/
│   └── Wallet.cs
│
├── Repositories/
│   ├── IWalletRepository.cs
│   └── WalletRepository.cs
│
├── Services/
│   └── WalletService.cs
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

<h3>Repository Contract</h3>

<p>
    Rather than reaching for a highly generic abstraction upfront, this example
    uses a focused repository that represents wallet-specific persistence behavior.
    Focused repositories tend to age better than generic CRUD abstractions because
    real systems usually grow to need domain-specific queries — and a
    <code>GetAll()</code> on a generic <code>IRepository&lt;T&gt;</code> rarely stays
    sufficient for long.
</p>

<pre><code class="language-csharp">public interface IWalletRepository
{
    IEnumerable&lt;Wallet&gt; GetAll();

    Wallet? GetById(int id);

    void Add(Wallet wallet);

    void Update(Wallet wallet);

    void Delete(int id);
}</code></pre>

<h3>Repository Implementation</h3>

<p>
    The implementation honors the contract and keeps all persistence details
    — in this case an in-memory list, in production a database — entirely
    behind the interface:
</p>

<pre><code class="language-csharp">public class WalletRepository : IWalletRepository
{
    private readonly List&lt;Wallet&gt; _wallets = new();

    public IEnumerable&lt;Wallet&gt; GetAll()
    {
        return _wallets;
    }

    public Wallet? GetById(int id)
    {
        return _wallets
            .FirstOrDefault(w =&gt; w.Id == id);
    }

    public void Add(Wallet wallet)
    {
        _wallets.Add(wallet);
    }

    public void Update(Wallet wallet)
    {
        var existingWallet = _wallets
            .FirstOrDefault(w =&gt; w.Id == wallet.Id);

        if (existingWallet is not null)
        {
            existingWallet.Name = wallet.Name;
            existingWallet.Currency = wallet.Currency;
            existingWallet.Balance = wallet.Balance;
        }
    }

    public void Delete(int id)
    {
        var wallet = _wallets
            .FirstOrDefault(w =&gt; w.Id == id);

        if (wallet is not null)
        {
            _wallets.Remove(wallet);
        }
    }
}</code></pre>

<h3>Using the Repository in a Service</h3>

<p>
    With the repository in place, <code>WalletService</code> can focus entirely on
    business operations. It has no idea how wallets are stored — and that ignorance
    is exactly the point. If you swap the in-memory implementation for one backed
    by Entity Framework Core tomorrow, the service doesn't change at all.
</p>

<pre><code class="language-csharp">public class WalletService
{
    private readonly IWalletRepository _repository;

    public WalletService(IWalletRepository repository)
    {
        _repository = repository;
    }

    public void CreateWallet(Wallet wallet)
    {
        _repository.Add(wallet);
    }

    public IEnumerable&lt;Wallet&gt; GetWallets()
    {
        return _repository.GetAll();
    }
}</code></pre>

<p>
    This separation pays off most when persistence logic, validation rules, or
    infrastructure concerns evolve at different speeds from business logic — which,
    in any system that lives long enough, they always do.
</p>

<h3>How the Flow Works</h3>

<p>
    In a layered architecture, services communicate with repositories instead of
    reaching into the database or ORM directly. The business layer expresses intent
    (<em>give me this wallet, save that one</em>); the repository layer decides how
    to fulfill it. That boundary also makes testing straightforward — swap the real
    repository for an in-memory mock and your service tests run without a database
    in sight.
</p>

<h3>Where Developers Commonly Overengineer Repositories</h3>

<p>
    Clean separation is valuable. A forest of abstractions is not. One of the most
    common mistakes I see in enterprise .NET codebases is reaching for generic
    repository layers before there's any real reason to:
</p>

<pre><code class="language-csharp">IRepository&lt;T&gt;
IAsyncRepository&lt;T&gt;
IReadOnlyRepository&lt;T&gt;
IUnitOfWork</code></pre>

<p>
    In many applications, these abstractions duplicate behavior that Entity Framework
    Core's <code>DbContext</code> and <code>DbSet</code> already provide — and they do it
    with more indirection, more files to navigate, and query behavior that's harder
    to follow. You end up wrapping a well-designed ORM with a leakier version of itself.
</p>

<p>
    Good architecture reduces complexity. It doesn't introduce layers that solve
    problems the application doesn't actually have.
</p>

<h3>Repository Pattern with Entity Framework Core</h3>

<p>
    With that in mind, some teams skip generic repository abstractions entirely when
    using EF Core — and reasonably so. <code>DbContext</code> already behaves like a
    repository and unit of work. In smaller applications, using it directly is often
    simpler and easier to maintain than wrapping it in additional layers.
</p>

<p>
    Repositories still earn their place, though, when the system grows into
    genuinely complex territory:
</p>

<ul>
    <li>business queries become complex and domain-specific</li>
    <li>multiple data sources need to be unified behind one interface</li>
    <li>persistence concerns must be isolated for testing at scale</li>
    <li>application logic needs to stay storage-agnostic across environments</li>
</ul>

<p>
    The right choice depends on where the system actually is — not where you imagine
    it might end up.
</p>

<h3>Key Takeaways</h3>

<ul>
    <li>Repositories isolate persistence concerns — but only introduce them when that isolation is genuinely needed</li>
    <li>Focused, domain-specific repositories age better than generic CRUD abstractions</li>
    <li>The pattern makes services testable without a real database — swap the implementation, not the interface</li>
    <li>EF Core's <code>DbContext</code> already provides repository-like behavior; wrapping it blindly adds indirection, not value</li>
    <li>Architecture decisions should be driven by real system pressure, not anticipated complexity</li>
</ul>

<h3>Final Note</h3>

<p>
    The real litmus test for a repository isn't "does this follow the pattern?" It's:
    does isolating persistence here make the system easier to change safely? If
    swapping the storage layer — from SQL to NoSQL, from one ORM to another — can
    happen without touching business logic, the repository is earning its keep.
    If it's just wrapping EF Core calls one-for-one with no added clarity, it's
    probably just noise.
</p>

<p>
    Use the pattern where the system pushes back. Let simplicity lead everywhere else.
</p>
`
},


];