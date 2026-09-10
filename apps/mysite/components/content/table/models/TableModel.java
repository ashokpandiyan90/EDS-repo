package com.mysite.core.models;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ExporterConstants;
import org.apache.commons.lang3.StringUtils;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.InjectionStrategy;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

/**
 * Sling Model for the Table component.
 *
 * <p>Maps JCR properties authored via {@code _cq_dialog/.content.xml} into
 * typed Java getters consumed by the HTL template ({@code table.html}).</p>
 *
 * <p>Registered for both adaptable types so the model can be used from HTL
 * (request-scoped, preferred) and programmatically from Resource-only contexts.</p>
 */
@Model(
    adaptables = {SlingHttpServletRequest.class, Resource.class},
    adapters    = {TableModel.class, ComponentExporter.class},
    resourceType = TableModel.RESOURCE_TYPE,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(
    name      = ExporterConstants.SLING_MODEL_EXPORTER_NAME,
    extensions = ExporterConstants.SLING_MODEL_EXTENSION
)
public class TableModel implements ComponentExporter {

    /** sling:resourceType of the component — must match .content.xml */
    public static final String RESOURCE_TYPE = "mysite/components/content/table";

    // ------------------------------------------------------------------ //
    //  Injected properties                                                 //
    // ------------------------------------------------------------------ //

    /** HTML produced by the RTE field (tableContent property). */
    @ValueMapValue(name = "tableContent", injectionStrategy = InjectionStrategy.OPTIONAL)
    private String tableContent;

    /**
     * Component variation: {@code "standard"} (default) or {@code "icon"}.
     * Drives both the CSS class and the HTL branch selected.
     */
    @ValueMapValue(name = "variation", injectionStrategy = InjectionStrategy.OPTIONAL)
    @Default(values = "standard")
    private String variation;

    /**
     * Optional explicit HTML id attribute.
     * When blank the HTL/FE layer can auto-generate one.
     */
    @ValueMapValue(name = "id", injectionStrategy = InjectionStrategy.OPTIONAL)
    private String id;

    @Self
    private SlingHttpServletRequest request;

    // ------------------------------------------------------------------ //
    //  Derived / computed fields                                           //
    // ------------------------------------------------------------------ //

    /** Assembled CSS class string placed on the component root div. */
    private String cssClasses;

    /** True when no table content has been authored. */
    private boolean empty;

    // ------------------------------------------------------------------ //
    //  Lifecycle                                                           //
    // ------------------------------------------------------------------ //

    @PostConstruct
    protected void init() {
        empty = StringUtils.isBlank(tableContent);

        List<String> classes = new ArrayList<>();
        classes.add("table-component");

        if ("icon".equals(variation)) {
            classes.add("table--icon");
        } else {
            classes.add("table--standard");
            variation = "standard"; // normalise null/empty to default
        }

        cssClasses = String.join(" ", classes);
    }

    // ------------------------------------------------------------------ //
    //  Getters                                                             //
    // ------------------------------------------------------------------ //

    /**
     * Returns the RTE-authored HTML content for the table.
     * The HTL template outputs this with {@code @ context='html'} (XSS-safe).
     *
     * @return HTML string or {@code null} when nothing has been authored.
     */
    public String getTableContent() {
        return tableContent;
    }

    /**
     * Returns the selected variation identifier.
     * Possible values: {@code "standard"}, {@code "icon"}.
     *
     * @return non-null variation string.
     */
    public String getVariation() {
        return variation;
    }

    /**
     * Returns the authored (or empty) component ID.
     *
     * @return id string, may be blank.
     */
    public String getId() {
        return id;
    }

    /**
     * Returns the space-separated CSS class string for the component root element.
     *
     * @return non-null CSS classes string.
     */
    public String getCssClasses() {
        return cssClasses;
    }

    /**
     * Indicates whether the component has no authored content.
     * Used by the HTL template to render an edit-mode placeholder.
     *
     * @return {@code true} when tableContent is blank.
     */
    public boolean isEmpty() {
        return empty;
    }

    // ------------------------------------------------------------------ //
    //  ComponentExporter                                                   //
    // ------------------------------------------------------------------ //

    /**
     * {@inheritDoc}
     * Required by the {@link ComponentExporter} interface for JSON export
     * (used by SPA / Content Services consumers).
     */
    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
